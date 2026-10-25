from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status as http_status
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    User, UserProfile, District, WeatherRecord,
    WaterConsumption, WaterPrediction,
    AirQuality, AirPrediction,
    TourismPressure, Tag, IncidentReport, Alert,
)
from .serializers import *
from .services.air_prediction import predict_air_quality, train_all_districts
from .services.water_anomalies import analyze_district, analyze_all_districts


# ==========================================
# 1. VIEWSETS DE PREDICCIÓN Y ANÁLISIS (IA)
# ==========================================

class PredictionViewSet(viewsets.ViewSet):
    """
    Endpoints de predicción y análisis.
    """

    @action(detail=False, methods=["get"], url_path="air-quality")
    def air_quality(self, request):
        ser = AirPredictionRequestSerializer(data=request.query_params)
        ser.is_valid(raise_exception=True)

        try:
            district = District.objects.get(pk=ser.validated_data["district"])
        except District.DoesNotExist:
            return Response({"detail": "District no existe"}, status=404)

        preds = predict_air_quality(district, hours=ser.validated_data["hours"])
        return Response({
            "district_id": district.id,
            "district_code": district.code,
            "hours": ser.validated_data["hours"],
            "predictions": AirPredictionSerializer(preds, many=True).data,
        })

    @action(detail=False, methods=["post"], url_path="air-quality/train")
    def air_quality_train(self, request):
        results = train_all_districts()
        return Response([
            {
                "district_code": r.district_code,
                "n_samples": r.n_samples,
                "mae_no2_model": round(r.mae_no2_model, 3),
                "mae_no2_baseline": round(r.mae_no2_baseline, 3),
                "mae_pm10_model": round(r.mae_pm10_model, 3),
                "mae_pm10_baseline": round(r.mae_pm10_baseline, 3),
                "adopted": r.adopted,
            } for r in results
        ])

    @action(detail=False, methods=["get"], url_path="water-anomalies")
    def water_anomalies(self, request):
        ser = WaterAnomalyRequestSerializer(data=request.query_params)
        ser.is_valid(raise_exception=True)
        try:
            district = District.objects.get(pk=ser.validated_data["district"])
        except District.DoesNotExist:
            return Response({"detail": "District no existe"}, status=404)

        result = analyze_district(district, lookback_days=ser.validated_data["lookback_days"])
        preds = WaterPrediction.objects.filter(district=district, is_anomaly=True)
        return Response({
            "district_id": district.id,
            "district_code": district.code,
            "total_readings": result.total_readings,
            "anomalies_detected": result.anomalies_detected,
            "anomalies": WaterPredictionSerializer(preds, many=True).data,
        })

    @action(detail=False, methods=["post"], url_path="water-anomalies/scan")
    def water_anomalies_scan(self, request):
        results = analyze_all_districts()
        return Response([
            {
                "district_code": r.district_code,
                "total_readings": r.total_readings,
                "anomalies_detected": r.anomalies_detected,
                "predictions_created": r.predictions_created,
            } for r in results
        ])


# ==========================================
# 2. VIEWSETS DEL DASHBOARD (MOCK DATA)
# ==========================================

class WaterDashboardViewSet(viewsets.ViewSet):
    """
    Endpoints para el panel de resiliencia urbana de AGUA.
    """

    @action(detail=False, methods=["get"], url_path="districts")
    def get_districts(self, request):
        mock_districts = [
            {"id": 1, "district_name": "Ciutat Vella", "latitude": 41.3800, "longitude": 2.1730, "current_consumption_m3": 1420.0, "status": "normal", "variance": "+2.5%"},
            {"id": 2, "district_name": "Eixample", "latitude": 41.3887, "longitude": 2.1589, "current_consumption_m3": 1250.5, "status": "warning", "variance": "+17.6%"},
            {"id": 3, "district_name": "Sants-Montjuïc", "latitude": 41.3721, "longitude": 2.1352, "current_consumption_m3": 1050.0, "status": "normal", "variance": "+4.3%"},
            {"id": 4, "district_name": "Gràcia", "latitude": 41.4025, "longitude": 2.1567, "current_consumption_m3": 610.8, "status": "warning", "variance": "+17.7%"},
            {"id": 5, "district_name": "Poblenou (Sant Martí)", "latitude": 41.3948, "longitude": 2.2025, "current_consumption_m3": 890.2, "status": "normal", "variance": "+1.2%"}
        ]
        return Response(mock_districts)

    @action(detail=False, methods=["get"], url_path="metrics")
    def get_metrics(self, request):
        district_id = int(request.query_params.get("district_id", 1))
        names = {1: "Ciutat Vella", 2: "Eixample", 3: "Sants-Montjuïc", 4: "Gràcia", 5: "Poblenou (Sant Martí)"}
        name = names.get(district_id, "Desconocido")
        
        mock_metrics = {
            "district_id": district_id,
            "district_name": name,
            "historical_data": [
                {"time": "12:00", "consumption": 1100.0, "anomaly": False},
                {"time": "14:00", "consumption": 1180.2, "anomaly": False},
                {"time": "16:00", "consumption": 1210.0, "anomaly": False},
                {"time": "18:00", "consumption": 1420.0 if district_id == 1 else 1250.5, "anomaly": True if district_id == 1 else False}
            ],
            "predictions": [
                {"time": "18:00", "predicted_consumption": 1250.5},
                {"time": "20:00", "predicted_consumption": 1290.0},
                {"time": "22:00", "predicted_consumption": 1150.0},
                {"time": "00:00", "predicted_consumption": 980.0}
            ]
        }
        return Response(mock_metrics)


class AirDashboardViewSet(viewsets.ViewSet):
    """
    Endpoints para el panel de calidad del AIRE.
    """

    @action(detail=False, methods=["get"], url_path="districts")
    def get_districts(self, request):
        mock_districts = [
            {"id": 1, "district_name": "Ciutat Vella", "latitude": 41.3800, "longitude": 2.1730, "current_no2": 45.2, "current_pm10": 28.5, "status": "critical", "variance": "+25.4%"},
            {"id": 2, "district_name": "Eixample", "latitude": 41.3887, "longitude": 2.1589, "current_no2": 38.5, "current_pm10": 22.1, "status": "warning", "variance": "+15.2%"},
            {"id": 3, "district_name": "Sants-Montjuïc", "latitude": 41.3721, "longitude": 2.1352, "current_no2": 25.0, "current_pm10": 18.4, "status": "normal", "variance": "+2.1%"},
            {"id": 4, "district_name": "Gràcia", "latitude": 41.4025, "longitude": 2.1567, "current_no2": 18.2, "current_pm10": 15.0, "status": "optimal", "variance": "-1.5%"},
            {"id": 5, "district_name": "Poblenou (Sant Martí)", "latitude": 41.3948, "longitude": 2.2025, "current_no2": 28.5, "current_pm10": 20.2, "status": "normal", "variance": "+4.8%"}
        ]
        return Response(mock_districts)

    @action(detail=False, methods=["get"], url_path="metrics")
    def get_metrics(self, request):
        district_id = int(request.query_params.get("district_id", 1))
        names = {1: "Ciutat Vella", 2: "Eixample", 3: "Sants-Montjuïc", 4: "Gràcia", 5: "Poblenou (Sant Martí)"}
        name = names.get(district_id, "Desconocido")
        
        mock_metrics = {
            "district_id": district_id,
            "district_name": name,
            "historical_data": [
                {"time": "12:00", "no2": 30.0, "pm10": 15.0},
                {"time": "14:00", "no2": 35.2, "pm10": 18.5},
                {"time": "16:00", "no2": 42.0, "pm10": 22.0},
                {"time": "18:00", "no2": 45.2 if district_id == 1 else 25.0, "pm10": 28.5 if district_id == 1 else 18.0}
            ],
            "predictions": [
                {"time": "20:00", "predicted_no2": 48.0, "predicted_pm10": 30.0},
                {"time": "22:00", "predicted_no2": 40.0, "predicted_pm10": 25.0},
                {"time": "00:00", "predicted_no2": 35.0, "predicted_pm10": 20.0},
                {"time": "02:00", "predicted_no2": 28.0, "predicted_pm10": 15.0}
            ]
        }
        return Response(mock_metrics)


# ==========================================
# 3. VIEWSETS CRUD (MODELOS)
# ==========================================

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")

    def get_serializer_class(self):
        return UserCreateSerializer if self.action == "create" else UserSerializer

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class DistrictViewSet(viewsets.ModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["code", "name"]


class WeatherRecordViewSet(viewsets.ModelViewSet):
    queryset = WeatherRecord.objects.all()
    serializer_class = WeatherRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["district", "date"]
    ordering_fields = ["date"]


class WaterConsumptionViewSet(viewsets.ModelViewSet):
    queryset = WaterConsumption.objects.select_related("district").all()
    serializer_class = WaterConsumptionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["district", "period_date"]
    ordering_fields = ["period_date"]


class WaterPredictionViewSet(viewsets.ModelViewSet):
    queryset = WaterPrediction.objects.select_related("district").all()
    serializer_class = WaterPredictionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["district", "is_anomaly", "status"]


class AirQualityViewSet(viewsets.ModelViewSet):
    queryset = AirQuality.objects.select_related("district").all()
    serializer_class = AirQualitySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["district", "period_date"]


class AirPredictionViewSet(viewsets.ModelViewSet):
    queryset = AirPrediction.objects.select_related("district").all()
    serializer_class = AirPredictionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["district"]


class TourismPressureViewSet(viewsets.ModelViewSet):
    queryset = TourismPressure.objects.select_related("district").all()
    serializer_class = TourismPressureSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["district", "period_date"]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class IncidentReportViewSet(viewsets.ModelViewSet):
    queryset = IncidentReport.objects.select_related("user", "district").prefetch_related("tags")
    serializer_class = IncidentReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["district", "status", "user"]
    search_fields = ["title", "description"]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.select_related("district").all()
    serializer_class = AlertSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["district", "alert_type", "severity", "status"]
    ordering_fields = ["created_at"]
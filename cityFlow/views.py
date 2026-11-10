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
from .services.air_forecast import predict_air_quality_for_dashboard


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
# 2. VIEWSETS DEL DASHBOARD (DATOS REALES)
# ==========================================

class WaterDashboardViewSet(viewsets.ViewSet):
    """
    Endpoints para el panel de resiliencia urbana de AGUA.
    """

    @action(detail=False, methods=["get"], url_path="districts")
    def get_districts(self, request):
        districts = District.objects.all()
        data = []

        for d in districts:
            last_consumption = WaterConsumption.objects.filter(district=d).order_by("-period_date").first()
            current_m3 = float(last_consumption.consumption_m3) if last_consumption else 0.0
            last_updated = last_consumption.period_date.isoformat() if last_consumption else "Sin datos"

            capacity = 1500.0 
            status = "optimal"
            if current_m3 >= (capacity * 0.9):
                status = "critical"
            elif current_m3 > (capacity * 0.75):
                status = "warning"
            elif current_m3 > (capacity * 0.5):
                status = "normal"

            data.append({
                "id": d.id,
                "district_name": d.name,
                "latitude": float(d.latitude) if d.latitude else 41.38,
                "longitude": float(d.longitude) if d.longitude else 2.17,
                "current_consumption_m3": round(current_m3, 2),
                "capacity_m3": capacity,
                "status": status,
                "variance": "+0.0%", 
                "last_updated": last_updated
            })

        return Response(data)

    @action(detail=False, methods=["get"], url_path="metrics")
    def get_metrics(self, request):
        district_id = int(request.query_params.get("district_id", 1))
        district = get_object_or_404(District, id=district_id)

        history = WaterConsumption.objects.filter(district=district).order_by("-period_date")[:10]
        history = reversed(list(history))
        
        historical_data = []
        for h in history:
            historical_data.append({
                "time": h.period_date.strftime("%d/%m"),
                "consumption": float(h.consumption_m3),
                "anomaly": False
            })

        predictions = []

        return Response({
            "district_id": district.id,
            "district_name": district.name,
            "historical_data": historical_data,
            "predictions": predictions
        })


class AirDashboardViewSet(viewsets.ViewSet):
    """
    Endpoints para el panel de calidad del AIRE.
    """

    @action(detail=False, methods=["get"], url_path="districts")
    def get_districts(self, request):
        districts_with_data = District.objects.filter(air_qualities__isnull=False).distinct()
        data = []

        for d in districts_with_data:
            # ✅ CAMBIO: Traemos solo los últimos 8 días (hoy + 7 días anteriores para la media)
            recent_records = list(AirQuality.objects.filter(district=d).order_by("-period_date")[:8])
            
            if not recent_records:
                continue
                
            today = recent_records[0]
            no2 = float(today.no2_level)
            pm10 = float(today.pm10_level)
            last_updated = today.period_date.isoformat()

            # Cálculo de la varianza REAL (Mixta: NO2 y PM10 vs Media de 7 días)
            variance_str = "0.0%"
            if len(recent_records) > 1:
                past_records = recent_records[1:] # 7 días anteriores
                
                # Varianza del NO2
                past_avg_no2 = sum([float(r.no2_level) for r in past_records]) / len(past_records)
                var_no2 = ((no2 - past_avg_no2) / past_avg_no2 * 100) if past_avg_no2 > 0 else 0
                
                # Varianza del PM10
                past_avg_pm10 = sum([float(r.pm10_level) for r in past_records]) / len(past_records)
                var_pm10 = ((pm10 - past_avg_pm10) / past_avg_pm10 * 100) if past_avg_pm10 > 0 else 0
                
                # Promedio de ambas varianzas para reflejar la tendencia global
                varianza_media = (var_no2 + var_pm10) / 2
                variance_str = f"{varianza_media:+.1f}%"


            # Cálculo del status según el ICA (Índice de Calidad del Aire)
            def get_ica_no2(val):
                if val <= 40: return "Buena", "normal"
                if val <= 90: return "Razonablemente buena", "normal"
                if val <= 120: return "Regular", "warning"
                if val <= 230: return "Desfavorable", "warning"
                if val <= 340: return "Muy desfavorable", "critical"
                return "Extremadamente desfavorable", "critical"

            def get_ica_pm10(val):
                if val <= 20: return "Buena", "normal"
                if val <= 40: return "Razonablemente buena", "normal"
                if val <= 50: return "Regular", "warning"
                if val <= 100: return "Desfavorable", "warning"
                if val <= 150: return "Muy desfavorable", "critical"
                return "Extremadamente desfavorable", "critical"

            cat_no2, status_no2 = get_ica_no2(no2)
            cat_pm10, status_pm10 = get_ica_pm10(pm10)

            if "critical" in (status_no2, status_pm10):
                status = "critical"
                category = cat_no2 if status_no2 == "critical" else cat_pm10
            elif "warning" in (status_no2, status_pm10):
                status = "warning"
                category = cat_no2 if status_no2 == "warning" else cat_pm10
            else:
                status = "normal"
                category = cat_no2 if cat_no2 == "Buena" else cat_pm10

            data.append({
                "id": d.id,
                "district_name": d.name,
                "latitude": float(d.latitude),
                "longitude": float(d.longitude),
                "current_no2": round(no2, 1),
                "current_pm10": round(pm10, 1),
                "status": status,
                "category": category, 
                "variance": variance_str,
                "last_updated": last_updated
            })

        return Response(data)

    @action(detail=False, methods=["get"], url_path="metrics")
    def get_metrics(self, request):
        district_id = request.query_params.get("district_id")
        if not district_id:
            return Response({"error": "Falta district_id"}, status=400)
        
        try:
            district = District.objects.get(id=int(district_id))
        except (ValueError, District.DoesNotExist):
            return Response({"error": "Distrito no encontrado"}, status=404)

        history_qs = AirQuality.objects.filter(district=district).order_by("-period_date")[:30]
        history_qs = reversed(list(history_qs))
        
        historical_data = []
        for h in history_qs:
            historical_data.append({
                "time": h.period_date.strftime("%d/%m"),
                "no2": float(h.no2_level),
                "pm10": float(h.pm10_level)
            })

        predictions = predict_air_quality_for_dashboard(district, days_to_predict=7)

        return Response({
            "district_id": district.id,
            "district_name": district.name,
            "historical_data": historical_data,
            "predictions": predictions
        })


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
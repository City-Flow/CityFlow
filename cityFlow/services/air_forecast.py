# cityFlow/services/air_forecast.py
import numpy as np
from datetime import timedelta
from sklearn.linear_model import LinearRegression
from cityFlow.models import AirQuality

def predict_air_quality_for_dashboard(district, days_to_predict=7):
    """
    Predicción usando Regresión Lineal basada en los últimos 90 días reales.
    Usa el día del año y el día de la semana como variables.
    """
    # 1. Traemos los últimos 90 días de datos reales
    history_qs = AirQuality.objects.filter(district=district).order_by("-period_date")[:90]
    history = list(history_qs)
    
    if len(history) < 10:
        return [] # No hay datos suficientes

    history.reverse() # Del más antiguo al más nuevo

    # 2. Preparamos las variables
    X = []
    y_no2 = []
    y_pm10 = []
    
    for record in history:
        day_of_year = record.period_date.timetuple().tm_yday
        day_of_week = record.period_date.weekday() 
        
        X.append([day_of_year, day_of_week])
        y_no2.append(float(record.no2_level))
        y_pm10.append(float(record.pm10_level))

    X = np.array(X)
    y_no2 = np.array(y_no2)
    y_pm10 = np.array(y_pm10)

    # 3. Entrenamos
    model_no2 = LinearRegression().fit(X, y_no2)
    model_pm10 = LinearRegression().fit(X, y_pm10)

    # 4. Generamos las predicciones
    predictions = []
    last_date = history[-1].period_date
    
    for i in range(1, days_to_predict + 1):
        future_date = last_date + timedelta(days=i)
        
        future_day_of_year = future_date.timetuple().tm_yday
        future_day_of_week = future_date.weekday()
        
        pred_no2 = model_no2.predict([[future_day_of_year, future_day_of_week]])[0]
        pred_pm10 = model_pm10.predict([[future_day_of_year, future_day_of_week]])[0]

        predictions.append({
            "time": future_date.strftime("%d/%m"),
            "predicted_no2": round(max(0, pred_no2), 1),
            "predicted_pm10": round(max(0, pred_pm10), 1)
        })

    return predictions
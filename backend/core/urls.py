from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view),
    path('risk-data/', views.get_risk_data),
    path('upload_data/', views.upload_data),
    path('save_selection/', views.save_selection),
]
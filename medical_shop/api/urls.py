from django.urls import path

from .views import AddMedicineView
urlpatterns = [
    
    path('add-medicine/',AddMedicineView.as_view(),name='add-medicine'),
]

from django.urls import path
from .views import my_won_artworks

urlpatterns = [
    path('my', my_won_artworks, name='my_won_artworks'),
]

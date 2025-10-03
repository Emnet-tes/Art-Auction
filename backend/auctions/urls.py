from django.urls import path
from . import views

urlpatterns = [
    path('artworks/', views.ArtworkListCreateView.as_view(), name='artwork-list'),
    path('artworks/<uuid:pk>/', views.ArtworkDetailView.as_view(), name='artwork-detail'),
    path('bids/', views.create_bid, name='create-bid'),
    path('bids/<uuid:artwork_id>/', views.artwork_bids, name='artwork-bids'),
]

from django.urls import path
from . import views
from .views import run_close_auctions

urlpatterns = [
    path('artworks/', views.ArtworkListCreateView.as_view(), name='artwork-list'),
    path('artworks/<str:pk>/', views.ArtworkDetailView.as_view(), name='artwork-detail'),
    path('bids/', views.create_bid, name='create-bid'),
    path('bids/<uuid:artwork_id>/', views.artwork_bids, name='artwork-bids'),
    path("bids/my", views.my_bids, name="my-bids"),
    path("cron/close-auctions/", run_close_auctions, name="close_auctions_cron"),
]

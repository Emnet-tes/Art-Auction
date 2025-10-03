from django.db import models
from django.contrib.auth import get_user_model
import uuid 

User = get_user_model()

class Artwork(models.Model):
    CATEGORY_CHOICES = [
        ('Painting', 'Painting'),
        ('Sculpture', 'Sculpture'),
        ('Digital', 'Digital'),
        ('Photography', 'Photography'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=50)
    description = models.TextField(max_length=500)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    image_url = models.URLField()
    starting_bid = models.DecimalField(max_digits=10, decimal_places=2)
    current_bid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_increment = models.DecimalField(max_digits=10, decimal_places=2)
    end_time = models.DateTimeField()
    highest_bidder = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='highest_bids')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Bid(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bid by {self.bidder.username} on {self.artwork.title}"

    class Meta:
        ordering = ['-timestamp']

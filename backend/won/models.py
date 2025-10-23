from django.db import models
import uuid
from django.conf import settings 
from auctions.models import Artwork

class Won(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artwork = models.OneToOneField(Artwork, on_delete=models.CASCADE, related_name='won')
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='won_artworks'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    won_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.artwork.title} won by {self.winner.username}"

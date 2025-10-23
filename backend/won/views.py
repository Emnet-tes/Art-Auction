from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Won
from .serializers import WonSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_won_artworks(request):
    won_items = Won.objects.filter(winner=request.user)
    serializer = WonSerializer(won_items, many=True)
    return Response(serializer.data)

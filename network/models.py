from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self',symmetrical=False,related_name="followers")

    def __str__(self):
        return self.username


class Posts(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")  # Use plural for related_name
    timestamp = models.DateTimeField(auto_now_add=True)
    content = models.TextField(max_length=500)
    likes = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,  # Return username instead of User object
            "content": self.content,
            "timestamp": self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),  # Format timestamp
            "likes": self.likes  # Include likes in serialization
        }

    def __str__(self):
        return f"{self.owner.username}: {self.content[:20]}..."  # String representation for easier debuggingpy
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name="followers")

    def __str__(self):
        return self.username

    def serialize(self):
        following_list = self.following.all()
        followers_list = self.followers.all()

        return {
            "username": self.username,
            "email": self.email,
            "following_count": following_list.count(),
            "follower_count": followers_list.count(),
            "following": [user.username for user in following_list],  # Serialize following usernames
            "followers": [user.username for user in followers_list]  # Serialize follower usernames
        }



class Posts(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")  # Use plural for related_name
    timestamp = models.DateTimeField(auto_now_add=True)
    content = models.TextField(max_length=500)
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)

    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,  # Return username instead of User object
            "content": self.content,
            "timestamp": self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),  # Format timestamp
            "likes": [user.username for user in self.likes.all()]  
        }

    def __str__(self):
        return f"{self.owner.username}: {self.content[:20]}..."  # String representation for easier debuggingpy
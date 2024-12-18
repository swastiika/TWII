
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("compose",views.new_post,name="new_post"),
    path("posts/<str:task>/", views.allpage, name='allpage'),
    path('profile/<str:username>/', views.showprofile, name='showprofile'),
    path('follow/<str:username>/', views.follow_user, name='follow_user'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow_user'),
    path('save-post/<int:post_id>',views.save_post,name="save_post"),
    path('followers/<str:username>/', views.get_follower_count, name='get_follower_count'),
    path('like/<int:post_id>/', views.toggle_like, name='toggle_like'),
    
]

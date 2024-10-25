
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("compose",views.new_post,name="new_post"),
    path("posts/<str:task>/", views.allpage, name='allpage'),
    path('profile/<str:username>/', views.showprofile, name='profile'),
    path('userposts/', views.userposts, name='userposts'),
    path('follow/<str:username>/', views.follow_user, name='follow_user'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow_user'),

]

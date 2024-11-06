from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render,get_object_or_404,redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.paginator import Paginator

from .models import User,Posts
from django.core import serializers

def index(request):
    return render(request, "network/index.html",{
        "current_user":request.user
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
@csrf_exempt
def new_post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get('content')

        # Create and save a new post (ensure the user is authenticated)
        post = Posts(owner=request.user, content=content)
        post.save()
        return HttpResponse(status=204)

    return JsonResponse({"error": "Invalid request"}, status=400)


def allpage(request,task):
    # Determine posts based on the task parameter
    if task == "allpost":
        page_list = Posts.objects.all().select_related('owner').order_by('-timestamp')
    elif task == "following":
        following_users = request.user.following.all()
        page_list = Posts.objects.filter(owner__in=following_users).select_related('owner').order_by('-timestamp')
    else:       
         # Find the user by username
        user = User.objects.get(username=task)
            # Filter the posts by this user
        page_list = Posts.objects.filter(owner=user).select_related('owner').order_by('-timestamp')



      # Set up pagination
    paginator = Paginator(page_list, 6)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Manually construct the serialized data to include the owner's name
    data = []
    for post in page_obj.object_list:
        data.append({
            'owner': post.owner.username,  # Get the owner's username
            'content': post.content,
            'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'is_own': post.owner == request.user,  # Format timestamp
            'id':post.id
        })

    response = {
        'posts': data,  # List of posts with owner info
        'page_number': page_obj.number,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
    }

    return JsonResponse(response, safe=False)  # Return JSON response



def showprofile(request,username):
    try:
        user = User.objects.get(username=username)
        data = user.serialize()
        is_owner = request.user == user

        # Construct the response data
        response = {
            "username": data['username'],
            "followers": data['followers'],
            "following": data['following'],
            "is_owner": is_owner,
            "follower_count":data['follower_count'],
            "following_count":data['following_count'],
            "email":data['email'],
            "current_user_is_follower": request.user.following.filter(username=username).exists()  
        }
        return JsonResponse(response)  # Use the serialize method to return JSON

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
@csrf_exempt
@login_required
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    request.user.following.add(user_to_follow)  # Add the user to the following list
    return HttpResponse(status = 204)  # Redirect to the profile page
@csrf_exempt
@login_required
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)
    request.user.following.remove(user_to_unfollow)  # Remove the user from the following list
    return HttpResponse(status = 204)

@csrf_exempt
@login_required
@csrf_exempt
def save_post(request, post_id):
    if request.method == "PUT":
            data = json.loads(request.body)
            updated_content = data.get("content")
            # Retrieve the post by ID and update its content
            post = Posts.objects.get(id=post_id)
            post.content = updated_content
            post.save()
            return HttpResponse(status=204)

    return JsonResponse({"error": "Invalid request"}, status=400)



def get_follower_count(request, username):
    user = get_object_or_404(User, username=username)
    follower_count = user.followers.count()  # Assuming the related name for followers is "followers"
    
    return JsonResponse({"follower_count": follower_count}, status=200)
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
            'is_own': post.owner == request.user  # Format timestamp
        })

    response = {
        'posts': data,  # List of posts with owner info
        'page_number': page_obj.number,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
    }

    return JsonResponse(response, safe=False)  # Return JSON response



def showprofile(request,username):
    user = User.objects.get(username=username)
    following_list = user.following.all()
    followers_list = user.followers.all()
    following = following_list.count()
    follower = followers_list.count()
    return render(request,"network/profile.html",{
        "following_list":followers_list,
        "follower_list":followers_list,
        "following":following,
        "follower":follower,
        "user":user,
        "current_user":request.user,
        'is_owner': user == request.user
    })


@login_required
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    request.user.following.add(user_to_follow)  # Add the user to the following list
    return redirect('profile', username=username)  # Redirect to the profile page

@login_required
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)
    request.user.following.remove(user_to_unfollow)  # Remove the user from the following list
    return redirect('profile', username=username)  # Redirect to the profile page



def save_post(request, post_id):
    try:
        # Parse the JSON data sent in the PUT request
        data = json.loads(request.body)
        updated_content = data.get("content")

        # Retrieve the post by ID and update its content
        post = Posts.objects.get(id=post_id)
        post.content = updated_content
        post.save()

        return JsonResponse({"success": True, "message": "Post updated successfully."})
    except Posts.DoesNotExist:
        return JsonResponse({"success": False, "message": "Post not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": "An error occurred."}, status=500)
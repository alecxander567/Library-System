from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from .forms import SignUpForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from .models import Book, UserAccount, Post
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from .forms import LoginForm
import json

# Landingpage
def landingpage(request):
    return render(request, "index.html")

# User homepage
@login_required
def userhomepage(request):
    return render(request, 'homepageUser.html')

# Admin page
@login_required
def adminpage(request):
    user_account = UserAccount.objects.get(user=request.user)
    
    # Only admins can access this page
    if user_account.role != 'admin': 
        # Redirect non-admins to user homepage 
        return redirect('user_home')  
    return render(request, 'adminpage.html')

# Sign up the user
def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()

            UserAccount.objects.create(user=user, role='user')

            login(request, user)
            return redirect('userhomepage')
    else:
        form = SignUpForm()

    return render(request, 'index.html', {'form': form})

# Log in
def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None: 
                login(request, user)

                try:
                    user_account = UserAccount.objects.get(user=user)
                    
                    if user_account.role == 'admin':
                        return redirect('adminpage')
                    else:
                        return redirect('userhomepage')

                except UserAccount.DoesNotExist:
                    messages.error(request, "User account doesn't exist.")
                    return redirect('login')

            else:
                messages.error(request, 'Invalid username or password.')
    else:
        form = LoginForm()

    return render(request, 'index.html', {'form': form})

# Add books (Admin View)
@login_required
def add_book(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        author = request.POST.get('author')
        year = request.POST.get('year_published')
        description = request.POST.get('description')
        image = request.FILES.get('image')

        if title and author:
            Book.objects.create(
                title=title,
                author=author,
                year_published=year,
                description=description,
                image=image
            )
            messages.success(request, 'Book successfully added!')
        else:
            messages.error(request, 'Book title and author are required.')

        return redirect('adminpage')

    return redirect('adminpage')

# Fetch all the books
def get_books(request):
    # Get all books, including the required fields
    books = Book.objects.all().values('title', 'author', 'year_published', 'category', 'description', 'image')

    for book in books:
        if book['image']:
            book['image'] = settings.MEDIA_URL + str(book['image'])

    # Convert queryset to list of dictionaries
    books_list = list(books)

    return JsonResponse({'books': books_list})

# Post (User View)
@login_required
def post_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data.get('content')

        if content:
            post = Post.objects.create(user=request.user, content=content)

            return JsonResponse({
                'success': True,
                'post': {
                    'username': post.user.username,
                    'content': post.content,
                    'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S')
                }
            })

        return JsonResponse({'success': False, 'message': 'Content is required.'})

    posts = Post.objects.all().order_by('-created_at')
    posts_data = []

    for post in posts:
        posts_data.append({
            'username': post.user.username,
            'content': post.content,
            'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return JsonResponse({'posts': posts_data})

# Display posts (User view)
@login_required
def get_posts(request):
    posts = Post.objects.all().order_by('-created_at')
    posts_data = []
    
    for post in posts:
        posts_data.append({
            'username': post.user.username,
            'content': post.content,
            'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        })
    
    return JsonResponse({'posts': posts_data})

# Log out
def logout_view(request):
    logout(request)
    return redirect('login')
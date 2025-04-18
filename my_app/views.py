from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from .forms import SignUpForm, LoginForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from .models import Book, UserAccount, Post, Comment
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required
import json
from django.shortcuts import get_object_or_404

# Landingpage
def landingpage(request):
    return render(request, "index.html")

# User homepage
@login_required
def userhomepage(request):
    return render(request, 'homepageUser.html')

# Timeline page (Users View)
@login_required
def timelineuser(request):
    return render(request, 'timeline.html')

# Books view (Users View)
@login_required
def books_users(request):
    return render(request, 'booksUser.html')

# Admin page
@login_required
def adminpage(request):
    user_account = UserAccount.objects.get(user=request.user)
    if user_account.role != 'admin': 
        return redirect('userhomepage')  
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
        category = request.POST.get('category')
        image = request.FILES.get('image')

        if title and author:
            Book.objects.create(
                title=title,
                author=author,
                year_published=year,
                description=description,
                image=image,
                category=category
            )
            messages.success(request, 'Book successfully added!')
        else:
            messages.error(request, 'Book title and author are required.')

        return redirect('adminpage')

# GET all books
def get_books(request):
    books = Book.objects.all().values('id', 'title', 'author', 'year_published', 'category', 'description', 'image')

    books_list = []
    for book in books:
        book_data = dict(book)
        if book_data['image']:
            book_data['image'] = request.build_absolute_uri(settings.MEDIA_URL + str(book_data['image']))
        else:
            book_data['image'] = request.build_absolute_uri(settings.MEDIA_URL + 'default-book-cover.jpg')
        books_list.append(book_data)

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
    post_data = []

    for post in posts:
        post_data.append({
            'id': post.id,
            'username': post.user.username,
            'content': post.content,
            'created_at': post.created_at.strftime('%Y-%m-%d %H:%M'),
            'like_count': post.total_likes(),
            'liked_by_user': request.user in post.likes.all(),
            'comments': [
                {
                    'username': comment.user.username,
                    'content': comment.content,
                    'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M')
                }
                for comment in post.comments.all()
            ],
            # Check if the logged-in user is the post owner
            'can_delete': request.user == post.user 
        })

    return JsonResponse({'posts': post_data})

# Like post (User View)
@login_required
def like_post(request, post_id):
    post = Post.objects.get(id=post_id)
    user = request.user

    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True

    return JsonResponse({
        'liked': liked,
        'like_count': post.total_likes()
    })
 
# Comments on posts (Users View)   
@login_required
def add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    if request.method == 'POST':
        content = request.POST.get('content')
        if content:
            comment = Comment.objects.create(user=request.user, post=post, content=content)
            return JsonResponse({
                'comment_id': comment.id,
                'username': comment.user.username,
                'content': comment.content,
                'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M')
            })

    return JsonResponse({'error': 'Invalid request'}, status=400)

# Delete posts view (Users View)
@login_required
def delete_post(request):
    if request.method == 'POST':
        post_id = request.POST.get('post_id')
        post = Post.objects.get(id=post_id)

        # Ensure the user is the owner of the post
        if post.user == request.user:  
            post.delete()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'You can only delete your own posts.'})
        
# Posts of the logged in user only (Users View)
@login_required
def get_user_posts(request):
    posts = Post.objects.filter(user=request.user).order_by('-created_at')
    post_data = []

    for post in posts:
        post_data.append({
            'id': post.id,
            'username': post.user.username,
            'content': post.content,
            'created_at': post.created_at.strftime('%Y-%m-%d %H:%M'),
            'like_count': post.total_likes(),
            'liked_by_user': request.user in post.likes.all(),
            'comments': [
                {
                    'username': comment.user.username,
                    'content': comment.content,
                    'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M')
                }
                for comment in post.comments.all()
            ],
            # Check if the logged-in user is the post owner
            'can_delete': request.user == post.user 
        })

    return JsonResponse({'posts': post_data})

# Get books for users (Users View)
def api_books(request):
    books = Book.objects.all()
    book_list = []

    for book in books:
        book_list.append({
            'title': book.title,
            'author': book.author,
            'year_published': book.year_published,
            'description': book.description,
            'category': book.category,
            'image': book.image.url if book.image else None,
        })

    return JsonResponse({'books': book_list})

# API endpoint to get a specific book's details (Admin View)
def get_book_detail(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    
    book_data = {
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'year_published': book.year_published,
        'category': book.category,
        'description': book.description,
        'image': book.image.url if book.image else None,
    }
    
    return JsonResponse(book_data)

def edit_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    
    if request.method == 'POST':
        book.title = request.POST.get('title')
        book.author = request.POST.get('author')
        book.year_published = request.POST.get('year_published')
        book.category = request.POST.get('category')
        book.description = request.POST.get('description')
        
        if 'image' in request.FILES:
            if book.image:
                book.image.delete(save=False)
            
            book.image = request.FILES['image']
        
        book.save()
        
        return redirect('adminpage')
    
    return redirect('adminpage')

# Log out
def logout_view(request):
    logout(request)
    return redirect('landingpage')
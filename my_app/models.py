from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    GENERAL = 'General'
    FICTION = 'Fiction'
    NON_FICTION = 'Non-Fiction'
    SCIENCE = 'Science'
    HISTORY = 'History'
    ROMANCE = 'Romance'

    CATEGORY_CHOICES = [
        (GENERAL, 'General'),
        (FICTION, 'Fiction'),
        (NON_FICTION, 'Non-Fiction'),
        (SCIENCE, 'Science'),
        (HISTORY, 'History'),
        (ROMANCE, 'Romance'),
    ]

    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    year_published = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='book_images/', null=True, blank=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default=GENERAL)
    rating = models.IntegerField(default=0)
    total_ratings = models.IntegerField(default=0)
    rating_sum = models.IntegerField(default=0)  # for calculating average 
    
    def update_rating(self, new_rating):
        self.rating_sum += new_rating
        self.total_ratings += 1
        self.rating = self.rating_sum / self.total_ratings
        self.save()

    def __str__(self):
        return self.title

class UserAccount(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    profile_picture = models.ImageField(upload_to='user_pics/', null=True, blank=True)

    def __str__(self):
        return self.user.username
    
class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True) 
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    def __str__(self):
        return f"Post by {self.user.username} on {self.created_at}"
    
    def total_likes(self):
        return self.likes.count()
    
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.created_at}"
    
class BookComment(models.Model):
    book = models.ForeignKey('Book', on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=100)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} on {self.book.title}"
    
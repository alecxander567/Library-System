from django.urls import path
from . import views

urlpatterns = [
    path('landingpage/', views.landingpage, name='landingpage'),
    path('userhomepage/', views.userhomepage, name='userhomepage'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login_view, name='login'),
    path('adminpage/', views.adminpage, name='adminpage'),
    path('add-book/', views.add_book, name='add_book'),
    path('api/books/', views.get_books, name='get_books'),
    path('api/post_user/', views.post_user, name='post_user'),
    path('api/get_posts/', views.get_posts, name='get_posts'),
    path('like/<int:post_id>/', views.like_post, name='like_post'),
    path('comment/<int:post_id>/', views.add_comment, name='add_comment'),
    path('api/delete_post/', views.delete_post, name='delete_post'),
    path('timeline/', views.timelineuser, name='timeline'),
    path('user-posts/', views.get_user_posts, name='user-posts'), 
    path('books-users/', views.books_users, name='books_users'),
    path('user/books/', views.api_books, name='user_books'),
    path('api/books/<int:book_id>/', views.get_book_detail, name='get_book_detail'),
    path('edit-book/<int:book_id>/', views.edit_book, name='edit_book'),
    path('logout/', views.logout_view, name='logout'),
]
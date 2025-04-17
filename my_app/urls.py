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
    path('logout/', views.logout_view, name='logout'),
]
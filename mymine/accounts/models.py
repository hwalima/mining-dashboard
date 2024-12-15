from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    """
    Custom User model for MyMine application
    Extends Django's AbstractUser to add mining-specific fields
    """
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('manager', 'Mine Manager'),
        ('supervisor', 'Shift Supervisor'),
        ('operator', 'Equipment Operator'),
        ('safety_officer', 'Safety Officer'),
        ('analyst', 'Data Analyst'),
    )

    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='operator')
    # Remove department field for now
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.FileField(upload_to='profile_pics/', null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    is_two_factor_enabled = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['username']

class UserActivity(models.Model):
    """
    Tracks user activities for audit trail
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    
    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"

    class Meta:
        verbose_name_plural = 'User Activities'
        ordering = ['-timestamp']

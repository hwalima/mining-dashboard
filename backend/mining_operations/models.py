from django.db import models
from django.core.validators import MinValueValidator

class Equipment(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    value_usd = models.DecimalField(max_digits=10, decimal_places=2)
    last_service_date = models.DateField()
    next_service_date = models.DateField()
    service_interval_days = models.IntegerField()
    status = models.CharField(max_length=20, default='OK', choices=[
        ('OK', 'OK'),
        ('Overdue', 'Overdue')
    ])

    def save(self, *args, **kwargs):
        # Update status based on service dates
        from datetime import date
        if self.next_service_date < date.today():
            self.status = 'Overdue'
        else:
            self.status = 'OK'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class EquipmentRunningTime(models.Model):
    date = models.DateField()
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='running_times')
    total_running_hours = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total running time in hours"
    )
    remarks = models.TextField(blank=True)

    class Meta:
        unique_together = ['date', 'equipment']
        ordering = ['-date', 'equipment']

    def __str__(self):
        return f"{self.equipment.name} - {self.date}"

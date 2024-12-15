import os
import sys
import django
from django.conf import settings

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from drf_spectacular.generators import SchemaGenerator
from drf_spectacular.settings import spectacular_settings

def generate_schema():
    """
    Generate and print OpenAPI schema with detailed error handling
    """
    try:
        generator = SchemaGenerator(
            title=spectacular_settings.TITLE,
            description=spectacular_settings.DESCRIPTION,
            version=spectacular_settings.VERSION
        )
        
        # Generate schema
        schema = generator.get_schema(request=None, public=True)
        
        # Write schema to file
        import json
        with open('openapi-schema.json', 'w') as f:
            json.dump(schema, f, indent=2)
        
        print("Schema generated successfully!")
        print("Schema saved to openapi-schema.json")
    
    except Exception as e:
        print(f"Error generating schema: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    generate_schema()

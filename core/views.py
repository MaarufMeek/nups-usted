import logging

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .models import Program, Hall, StudentProfile, Wing
from .serializers import ProgramSerializer, HallSerializer, StudentProfileSerializer, WingSerializer

logger = logging.getLogger(__name__)


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny]


class HallViewSet(viewsets.ModelViewSet):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    permission_classes = [AllowAny]


class StudentViewSet(CreateModelMixin, ListModelMixin, RetrieveModelMixin, GenericViewSet):
    """
    Student profile endpoints:
    - POST /api/students/ - Submit student profile (public)
    - GET /api/students/ - List all students (admin - for retrieving all submissions)
    - GET /api/students/{id}/ - Get single student (admin)
    """
    queryset = StudentProfile.objects.all().order_by('-created_at')  # Newest first
    serializer_class = StudentProfileSerializer

    def get_permissions(self):
        """
        Allow anyone to submit form but require authentication to retrieve student info.
        """
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """Override create to add detailed error logging"""
        try:
            logger.info(f"Creating student profile. Data keys: {list(request.data.keys())}")
            logger.info(f"Has file: {'id_picture' in request.FILES}")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            logger.info("Serializer is valid, saving...")
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Student profile created successfully: {serializer.data.get('id')}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            logger.error(f"Error creating student profile: {str(e)}", exc_info=True)
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': str(e), 'detail': 'Failed to create student profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        # save member profile
        try:
            logger.info("Saving student profile...")
            student = serializer.save()
            logger.info(f"Student profile saved successfully. ID: {student.id}, Email: {student.email}")
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}", exc_info=True)
            raise  # Re-raise to be caught by create() method




class WingViewSet(viewsets.ModelViewSet):
    queryset = Wing.objects.all()
    serializer_class = WingSerializer
    permission_classes = [AllowAny]




# def create_superuser_view(request):
#     User = get_user_model()
#
#     username = "nupsadmin"
#     email = "admin@nups.com"
#     password = "easypassword123!"
#
#     if not User.objects.filter(username=username).exists():
#         User.objects.create_superuser(username=username, email=email, password=password)
#         return HttpResponse("Superuser created successfully!")
#     return HttpResponse("Superuser already exists.")



# Predefined data
# PROGRAMS = [
#     "B. A. Arabic Education",
#     "B. A. English Education",
#     "B. A. French Education",
#     "B. A. French with English Education",
#     "B. A. Social Studies with Economics Education",
#     "B.Ed. Early Grade (Early Childhood)",
#     "B. Sc. Fashion Design and Textiles Education",
#     "B. Sc. Catering and Hospitality Education",
#     "B. B. A. Secretarial Education",
#     "B. Sc. Management Education",
#     "B. Sc. Marketing",
#     "B. B. A. Executive Office Administration",
#     "B. Sc. Marketing and Entrepreneurship",
#     "B.B.A. Human Resource Management",
#     "B. Sc. Economics with Social Studies Education",
#     "B. Sc. Economics Education",
#     "B. Sc. Accounting Education",
#     "B. Sc. Admin Accounting",
#     "B. Sc. Procurement and Supply Chain Management",
#     "B. Sc. Banking and Finance",
#     "B. Sc. Business Information Systems",
#     "B. Sc. Mathematics Education",
#     "B. Sc. Information Technology Education",
#     "B.Sc. Information Technology",
#     "B.Sc. Cybersecurity and Digital Forensics",
#     "B. Sc. Automotive Engineering Technology Education",
#     "B. Sc. Mechanical Engineering Technology Education",
#     "B.Sc. Construction Technology and Management with Education",
#     "B.Sc. Welding and Fabrication Engineering Technology Education",
#     "B.Sc. Plumbing, Gas and Sanitary Technology",
#     "B.Sc Civil Engineering",
#     "B.Sc. Wood Technology with Education",
#     "B. Sc. Electrical and Electronics Engineering Technology Education",
#     "B.Sc. Mechanical Engineering Technology",
#     "B.Sc. Electrical and Electronics Engineering",
#     "2-year Post-Diploma in Construction Technology",
#     "2-year Post-Diploma in Automotive Engineering Technology",
#     "2-year Post-Diploma in Electrical and Electronics Engineering Technology",
#     "2-year Diploma in Wood Technology",
#     "2-year Diploma Business Admin Accounting",
#     "Diploma in Human Resource Management",
#     "Diploma in Office Management and Computer Applications",
#     "2-year Diploma Business Admin Management",
# ]


# @api_view(['GET', 'POST'])
# @permission_classes([AllowAny])
# def populate_initial_data(request):
#     # Programs
#     created_programs = []
#     for program_name in PROGRAMS:
#         obj, created = Program.objects.get_or_create(name=program_name)
#         if created:
#             created_programs.append(program_name)
#
#     # Wings
#     created_wings = []
#     for wing_name in WINGS:
#         obj, created = Wing.objects.get_or_create(name=wing_name)
#         if created:
#             created_wings.append(wing_name)
#
#     return JsonResponse({
#         "programs_created": created_programs,
#         "wings_created": created_wings,
#         "message": "Initial data population complete."
#     })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to keep Render service awake.
    To be pinged by external service UptimeRobot
    every 5 minutes to prevent the service from sleeping.
    """
    return Response({
        'status': 'healthy',
        'service': 'NUPS API',
        'timestamp': timezone.now().isoformat(),
        'message': 'Service is running'
    }, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def backup_database(request):
    """
    Create a complete SQL backup from Render (production).
    Images are stored in Cloudinary, so only SQL is backed up.
    Image URLs remain accessible after restore.

    GET /api/backup/ - Download SQL backup file
    """
    from django.http import HttpResponse
    from django.db import connection
    from django.conf import settings
    import datetime as dt
    from datetime import datetime as dt_class

    try:
        sql_content = ["-- NUPS Database Complete Backup", f"-- Generated: {dt_class.now().isoformat()}",
                       "-- Database: PostgreSQL", "-- ============================================",
                       "-- STORAGE CONFIGURATION", "-- ============================================"]

        # ============================================
        # STORAGE CONFIGURATION INFO
        # ============================================

        # BEST FIX: Check USE_CLOUDINARY setting first (from your settings.py)
        use_cloudinary = getattr(settings, 'USE_CLOUDINARY', False)

        # Also check DEFAULT_FILE_STORAGE as backup detection
        storage_backend = getattr(settings, 'DEFAULT_FILE_STORAGE',
                                  'django.core.files.storage.FileSystemStorage')

        # Convert storage backend to string for logging
        if hasattr(storage_backend, '__name__'):
            storage_backend_str = storage_backend.__name__
        elif hasattr(storage_backend, '__class__'):
            storage_backend_str = storage_backend.__class__.__name__
        else:
            storage_backend_str = str(storage_backend)

        # Determine if using Cloudinary (primary: USE_CLOUDINARY setting)
        is_cloudinary = use_cloudinary

        # If USE_CLOUDINARY not set, fall back to checking class name
        if not is_cloudinary and isinstance(storage_backend_str, str):
            is_cloudinary = 'cloudinary' in storage_backend_str.lower()

        if is_cloudinary:
            sql_content.append("-- STORAGE: Cloudinary (Production)")
            sql_content.append("-- Images are stored in Cloudinary cloud storage")
            sql_content.append("-- Image URLs will remain accessible after restore")

            # Add Cloudinary config (without secrets)
            cloudinary_config = getattr(settings, 'CLOUDINARY_STORAGE', {})
            if cloudinary_config:
                cloud_name = cloudinary_config.get('CLOUD_NAME', 'Not set')
                sql_content.append(f"-- Cloud Name: {cloud_name}")
                sql_content.append(f"-- Image URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/...")
        else:
            sql_content.append("-- STORAGE: Local (Development)")
            sql_content.append("-- Storage backend: " + storage_backend_str)
            sql_content.append("-- WARNING: Images are stored locally and NOT included in this backup")
            sql_content.append("-- To backup images, manually copy the 'media' folder")

        sql_content.append("-- ============================================")
        sql_content.append("")

        sql_content.append("-- This backup includes schema (CREATE TABLE) and data (INSERT)")
        sql_content.append("-- Restore using: psql -d database_name < backup.sql")
        sql_content.append("")
        sql_content.append("BEGIN;")
        sql_content.append("")

        # ============================================
        # PART 1: Generate CREATE TABLE statements
        # ============================================
        sql_content.append("-- ============================================")
        sql_content.append("-- SCHEMA: Table Definitions")
        sql_content.append("-- ============================================")
        sql_content.append("")

        # Get all tables and order them to respect dependencies
        with connection.cursor() as cursor:
            cursor.execute("""
                           SELECT table_name
                           FROM information_schema.tables
                           WHERE table_schema = 'public'
                             AND table_name LIKE 'core_%'
                           ORDER BY table_name;
                           """)
            all_tables = [row[0] for row in cursor.fetchall()]

            # We need to sort tables so parent tables come before child tables
            # Get foreign key dependencies
            table_dependencies = {}
            for table in all_tables:
                cursor.execute(f"""
                    SELECT
                        ccu.table_name AS parent_table
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_schema = 'public'
                        AND tc.table_name = '{table}';
                """)
                parents = [row[0] for row in cursor.fetchall()]
                table_dependencies[table] = parents

            # Sort tables by dependencies (topological sort)
            sorted_tables = []
            temp_marked = set()
            perm_marked = set()

            def visit(table):
                if table in perm_marked:
                    return
                if table in temp_marked:
                    raise ValueError(f"Circular dependency detected with table {table}")

                temp_marked.add(table)
                for parent in table_dependencies.get(table, []):
                    if parent in all_tables:  # Only consider core_ tables
                        visit(parent)
                temp_marked.remove(table)
                perm_marked.add(table)
                sorted_tables.append(table)

            for table in all_tables:
                if table not in perm_marked:
                    visit(table)

            # Create tables in dependency order
            for table_name in sorted_tables:
                sql_content.append(f"-- Table: {table_name}")
                sql_content.append(f"DROP TABLE IF EXISTS \"{table_name}\" CASCADE;")

                # Get column definitions
                cursor.execute(f"""
                    SELECT 
                        column_name,
                        data_type,
                        character_maximum_length,
                        is_nullable,
                        column_default,
                        numeric_precision,
                        numeric_scale
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = '{table_name}'
                    ORDER BY ordinal_position;
                """)
                columns_data = cursor.fetchall()

                # Get primary key
                cursor.execute(f"""
                    SELECT column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu 
                        ON tc.constraint_name = kcu.constraint_name
                    WHERE tc.table_schema = 'public' 
                        AND tc.table_name = '{table_name}'
                        AND tc.constraint_type = 'PRIMARY KEY';
                """)
                pk_columns = [row[0] for row in cursor.fetchall()]

                # Get foreign keys
                cursor.execute(f"""
                    SELECT
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name,
                        rc.delete_rule,
                        tc.constraint_name
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                    JOIN information_schema.referential_constraints AS rc
                        ON rc.constraint_name = tc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_schema = 'public'
                        AND tc.table_name = '{table_name}';
                """)
                foreign_keys = cursor.fetchall()

                # Build CREATE TABLE statement
                sql_content.append(f"CREATE TABLE \"{table_name}\" (")

                column_defs = []
                for col_data in columns_data:
                    col_name, data_type, max_length, is_nullable, default, precision, scale = col_data

                    col_def = f'"{col_name}"'

                    # Build data type
                    if data_type == 'character varying':
                        col_def += f" VARCHAR({max_length})" if max_length else " VARCHAR"
                    elif data_type == 'character':
                        col_def += f" CHAR({max_length})" if max_length else " CHAR"
                    elif data_type == 'numeric':
                        if precision and scale:
                            col_def += f" NUMERIC({precision},{scale})"
                        elif precision:
                            col_def += f" NUMERIC({precision})"
                        else:
                            col_def += " NUMERIC"
                    elif data_type == 'integer':
                        col_def += " INTEGER"
                    elif data_type == 'bigint':
                        col_def += " BIGINT"
                    elif data_type == 'smallint':
                        col_def += " SMALLINT"
                    elif data_type == 'boolean':
                        col_def += " BOOLEAN"
                    elif data_type == 'date':
                        col_def += " DATE"
                    elif data_type == 'timestamp with time zone':
                        col_def += " TIMESTAMP WITH TIME ZONE"
                    elif data_type == 'timestamp without time zone':
                        col_def += " TIMESTAMP WITHOUT TIME ZONE"
                    elif data_type == 'text':
                        col_def += " TEXT"
                    else:
                        col_def += f" {data_type.upper()}"

                    # Primary key
                    if col_name in pk_columns:
                        if 'SERIAL' in col_def or 'BIGSERIAL' in col_def:
                            pass  # Already includes PRIMARY KEY
                        else:
                            col_def += " PRIMARY KEY"

                    # NULL/NOT NULL
                    if is_nullable == 'NO' and col_name not in pk_columns:
                        col_def += " NOT NULL"

                    # Default value
                    if default:
                        # Clean up default (remove ::type casts)
                        default_clean = default.split('::')[0].strip()
                        col_def += f" DEFAULT {default_clean}"

                    column_defs.append(col_def)

                sql_content.append(",\n".join(column_defs))

                # Add foreign key constraints AFTER column definitions
                if foreign_keys:
                    sql_content.append(",\n")
                    fk_constraints = []
                    for fk in foreign_keys:
                        col_name, foreign_table, foreign_col, delete_rule, constraint_name = fk
                        delete_action = delete_rule.upper() if delete_rule else 'NO ACTION'
                        fk_constraints.append(
                            f'    CONSTRAINT "{constraint_name}" FOREIGN KEY ("{col_name}") '
                            f'REFERENCES "{foreign_table}" ("{foreign_col}") '
                            f'ON DELETE {delete_action}'
                        )
                    sql_content.append(",\n".join(fk_constraints))

                sql_content.append(");")
                sql_content.append("")

        # ============================================
        # PART 2: Generate INSERT statements (data)
        # ============================================
        sql_content.append("-- ============================================")
        sql_content.append("-- DATA: Insert Statements")
        sql_content.append("-- ============================================")
        sql_content.append("")

        # We'll query each table directly instead of using dumpdata
        with connection.cursor() as cursor:
            for table_name in sorted_tables:
                # Get column names for this table
                cursor.execute(f"""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = '{table_name}'
                    ORDER BY ordinal_position;
                """)
                columns = [row[0] for row in cursor.fetchall()]

                # Get all data from table
                cursor.execute(f'SELECT * FROM "{table_name}" ORDER BY id;')
                rows = cursor.fetchall()

                if not rows:
                    continue

                sql_content.append(f"-- Data for {table_name}")
                sql_content.append(f"-- {len(rows)} records")
                sql_content.append("")

                for row in rows:
                    values = []
                    for val in row:
                        if val is None:
                            values.append('NULL')
                        elif isinstance(val, str):
                            # Escape single quotes and backslashes
                            escaped = val.replace("\\", "\\\\").replace("'", "''")
                            values.append(f"'{escaped}'")
                        elif isinstance(val, bool):
                            values.append('TRUE' if val else 'FALSE')
                        elif isinstance(val, (int, float)):
                            values.append(str(val))
                        elif isinstance(val, (dt.date, dt_class)):  # Handle both date and datetime
                            values.append(f"'{val.isoformat()}'")
                        else:
                            # Convert to string and escape
                            escaped = str(val).replace("\\", "\\\\").replace("'", "''")
                            values.append(f"'{escaped}'")

                    col_list = ', '.join(f'"{col}"' for col in columns)
                    val_list = ', '.join(values)
                    sql_content.append(f'INSERT INTO "{table_name}" ({col_list}) VALUES ({val_list});')

                sql_content.append("")

        # ============================================
        # PART 3: Add image metadata summary (optional)
        # ============================================
        if is_cloudinary:
            sql_content.append("-- ============================================")
            sql_content.append("-- IMAGE METADATA SUMMARY")
            sql_content.append("-- ============================================")
            sql_content.append("")

            with connection.cursor() as cursor:
                # Count students with ID pictures
                cursor.execute("""
                               SELECT COUNT(*)                     as total_students,
                                      COUNT(id_picture)            as students_with_pictures,
                                      COUNT(*) - COUNT(id_picture) as students_without_pictures
                               FROM core_studentprofile
                               """)
                counts = cursor.fetchone()

                if counts:
                    total, with_pics, without_pics = counts
                    sql_content.append(f"-- Total students: {total}")
                    sql_content.append(f"-- Students with ID pictures: {with_pics}")
                    sql_content.append(f"-- Students without ID pictures: {without_pics}")
                    sql_content.append("")

                # List all image files stored in Cloudinary
                sql_content.append("-- All images are stored in Cloudinary at:")
                cloudinary_config = getattr(settings, 'CLOUDINARY_STORAGE', {})
                if cloudinary_config.get('CLOUD_NAME'):
                    sql_content.append(
                        f"-- https://res.cloudinary.com/{cloudinary_config.get('CLOUD_NAME')}/image/upload/")
                sql_content.append("")

                # Get a few sample image URLs to show format
                cursor.execute("""
                               SELECT id, first_name, last_name, id_picture
                               FROM core_studentprofile
                               WHERE id_picture IS NOT NULL
                               LIMIT 3
                               """)
                sample_images = cursor.fetchall()

                if sample_images:
                    sql_content.append("-- Sample image paths (as stored in database):")
                    for student_id, first_name, last_name, image_path in sample_images:
                        if image_path:
                            sql_content.append(f"-- Student {student_id}: {first_name} {last_name}")
                            sql_content.append(f"--   Image: {image_path}")
                    sql_content.append("")

        sql_content.append("COMMIT;")

        sql_output = '\n'.join(sql_content)

        # Create response
        timestamp = dt_class.now().strftime('%Y%m%d_%H%M%S')
        filename = f'nups_backup_{timestamp}.sql'

        response = HttpResponse(sql_output, content_type='application/sql')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = len(sql_output.encode('utf-8'))

        logger.info(f"Database backup created and downloaded: {filename}")
        logger.info(f"USE_CLOUDINARY setting: {use_cloudinary}")
        logger.info(f"Storage backend: {storage_backend_str}")
        return response

    except Exception as e:
        logger.error(f"Backup failed: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e), 'detail': 'Failed to create database backup'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )





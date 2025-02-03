from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from spire.doc import Document, FileFormat
from urllib.parse import unquote
from pydantic import BaseModel
from dotenv import load_dotenv
from threading import Thread
from pathlib import Path
import shutil
import uuid
import os

from blog_writer import generate_blog
from main import (
    run_analysis_crew,
    get_available_keywords,
    save_keyword_details,
    run_seo_crew,
    run_blog_crew
)

# Load environment variables
load_dotenv()
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")

app = FastAPI()

# CORS middleware configuration to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    allow_credentials=True,
)

class UserData(BaseModel):
    """Model for user data input."""
    institution_name: str
    domain_url: str

class KeywordsData(BaseModel):
    """Model for keywords data input."""
    keywords: list

class OutlineData(BaseModel):
    """Model for outline data input."""
    outline: str

def create_user_directory(userId):
    """Create user-specific directories for storing outputs.

    Args:
        userId (str): Unique identifier for the user.
    """
    try:
        user_dir = Path('outputs') / userId
        crew_dir = user_dir / 'crew'
        data_dir = user_dir / 'data'
        blogs_dir = user_dir / 'blogs'

        user_dir.mkdir(parents=True, exist_ok=True)
        crew_dir.mkdir(exist_ok=True)
        data_dir.mkdir(exist_ok=True)
        blogs_dir.mkdir(exist_ok=True)
    except Exception as e:
        print(f"Error creating directories for user {userId}: {str(e)}")

def cleanup_user_directory(userId):
    """Remove the user-specific directory and all its contents.

    Args:
        userId (str): Unique identifier for the user.
    """
    try:
        user_dir = Path('outputs') / userId
        if user_dir.exists():
            shutil.rmtree(user_dir)
    except Exception as e:
        print(f"Error cleaning up directory for user {userId}: {str(e)}")

def convert_markdown_to_docx(markdown_file, output_filename, userId):
    """Convert a markdown file to a DOCX file and save it.

    Args:
        markdown_file (Path): Path to the markdown file to convert.
        output_filename (str): Name of the output DOCX file.
        userId (str): Unique identifier for the user.

    Returns:
        Path: Path to the saved DOCX file, or None if conversion failed.
    """
    try:
        # Setup output directory for DOCX files
        doc_dir = Path('outputs') / userId / 'doc'
        doc_dir.mkdir(parents=True, exist_ok=True)
        output_path = doc_dir / output_filename

        # Load the markdown file and save it as DOCX
        doc = Document()
        doc.LoadFromFile(str(markdown_file))
        doc.SaveToFile(str(output_path), FileFormat.Docx2016)
        doc.Dispose()

        print(f"✅ Saved to: {output_path}")
        return output_path

    except Exception as e:
        print(f"Error converting {markdown_file}: {str(e)}")
        return None

@app.get('/download/{userId}/{filename}')
async def download_file(userId: str, filename: str):
    """Endpoint to download converted DOCX files.

    Args:
        userId (str): Unique identifier for the user.
        filename (str): Name of the file to download.

    Returns:
        FileResponse: The requested file for download.
    """
    try:
        if not userId:
            raise HTTPException(status_code=400, detail='User ID is required')

        file_path = Path('outputs') / userId / 'doc' / filename

        # Check if the file exists before attempting to download
        if not file_path.exists():
            print(f"File not found: {file_path}")
            raise HTTPException(status_code=404, detail=f'File not found: {filename}')

        print(f"File found, sending: {file_path}")

        return FileResponse(
            path=file_path,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"Error in download_file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/analysis")
def run_analysis(data: UserData):
    """Run the analysis process for the given user data.

    Args:
        data (UserData): User data containing institution name and domain URL.

    Returns:
        JSONResponse: Result of the analysis process.
    """
    try:
        institution_name = data.institution_name
        domain_url = data.domain_url

        # Generate a unique user ID
        userId = str(uuid.uuid4())

        create_user_directory(userId)

        output_dir = Path('outputs') / userId

        # Start the analysis process in a separate thread
        result = Thread(target=run_analysis_crew, args=(userId, institution_name, domain_url, output_dir))
        result.start()
        result.join()

        print("Analysis crew run complete")

        # Clean the analysis markdown file
        analysis_path = output_dir / 'crew' / '1_analysis.md'
        if analysis_path.exists():
            with open(analysis_path, 'r', encoding='utf-8') as f:
                analysis_content = f.readlines()
            analysis_content = [line for line in analysis_content if line.strip() != '```markdown' and line.strip() != '```']
            with open(analysis_path, 'w', encoding='utf-8') as f:
                f.writelines(analysis_content)

        # Serve the analysis markdown file
        markdown_content = {}
        if analysis_path.exists():
            with open(analysis_path, 'r', encoding='utf-8') as f:
                markdown_content['analysis'] = f.read()

        # Convert the analysis markdown file to a DOCX file
        docx_files = {}
        for file_info in [
            ('1_analysis.md', 'analysis.docx', 'analysis')
        ]:
            md_file = output_dir / 'crew' / file_info[0]
            if md_file.exists():
                print(f"Converting {md_file} to {file_info[1]}")
                if convert_markdown_to_docx(md_file, file_info[1], userId):
                    docx_files[file_info[2]] = file_info[1]
            else:
                print(f"Warning: {md_file} not found")

        return JSONResponse(content={
            'status': 'success',
            'message': 'Analysis completed successfully',
            'userId': userId,
            'docxFiles': docx_files,
            'markdown': markdown_content
        })

    except Exception as e:
        print(f"Error in /run/analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/keywords")
def get_keywords(userId: str):
    """Retrieve available keywords for the specified user.

    Args:
        userId (str): Unique identifier for the user.

    Returns:
        JSONResponse: List of available keywords.
    """
    try:
        if not userId:
            raise HTTPException(status_code=400, detail='User ID is required')

        # Fetch available keywords using the function from main.py
        keywords_result = get_available_keywords(userId)

        return JSONResponse(content=keywords_result)
    except Exception as e:
        print(f"Error in get_keywords: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/keywords/save/{userId}")
def save_keywords(userId: str, data: KeywordsData):
    """Save keywords for the specified user.

    Args:
        userId (str): Unique identifier for the user.
        data (KeywordsData): Data containing the list of keywords.

    Returns:
        JSONResponse: Status of the save operation.
    """
    try:
        keywords = data.keywords

        if not userId:
            raise HTTPException(status_code=400, detail='User ID is required')

        save_keyword_details(userId, keywords)
        return JSONResponse(content={'status': 'success'})
    except Exception as e:
        print(f"Error in save_keywords: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/seo/{userId}")
def run_seo(userId: str, data: UserData):
    """Run the SEO process for the given user data.

    Args:
        userId (str): Unique identifier for the user.
        data (UserData): User data containing institution name and domain URL.

    Returns:
        JSONResponse: Result of the SEO process.
    """
    try:
        institution_name = data.institution_name
        domain_url = data.domain_url

        if not userId:
            raise HTTPException(status_code=400, detail='User ID is required')

        # Start the SEO process in a separate thread
        result = Thread(target=run_seo_crew, args=(userId, institution_name, domain_url))
        result.start()
        result.join()

        crew_dir = Path('outputs') / userId / 'crew'

        # List of markdown files to clean
        markdown_files = [
            ('2_ad_copies.md', 'ad'),
            ('3_blog_post_outlines.md', 'outlines')
        ]
        for file_name, _ in markdown_files:
            file_path = crew_dir / file_name
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.readlines()
                content = [line for line in content if line.strip() != '```markdown' and line.strip() != '```']
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(content)

        # Serve the SEO markdown files
        markdown_content = {}
        markdown_files = {
            'ad': crew_dir / '2_ad_copies.md',
            'outlines': crew_dir / '3_blog_post_outlines.md'
        }
        for key, path in markdown_files.items():
            if path.exists():
                with open(path, 'r', encoding='utf-8') as f:
                    markdown_content[key] = f.read()

        # Convert the SEO markdown files to DOCX files
        docx_files = {}
        file_info = [
            ('2_ad_copies.md', 'ad_copies.docx', 'ad'),
            ('3_blog_post_outlines.md', 'blog_post_outlines.docx', 'outlines')
        ]
        for file_info in file_info:
            md_file = crew_dir / file_info[0]
            if md_file.exists():
                print(f"Converting {md_file} to {file_info[1]}")
                if convert_markdown_to_docx(md_file, file_info[1], userId):
                    docx_files[file_info[2]] = file_info[1]
            else:
                print(f"Warning: {md_file} not found")

        return JSONResponse(content={
            'status': 'success',
            'markdown': markdown_content,
            'docxFiles': docx_files
        })
    except Exception as e:
        print(f"Error in /run/seo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-blog/{user_id}")
def generate_blog_endpoint(user_id: str, data: OutlineData):
    """Generate a blog post based on the provided outline.

    Args:
        user_id (str): Unique identifier for the user.
        data (OutlineData): Data containing the outline for the blog post.

    Returns:
        JSONResponse: Status of the blog generation process.
    """
    try:
        # Decode and sanitize outline
        outline = unquote(data.outline).strip()

        # Additional validation
        if not outline:
            raise HTTPException(status_code=400, detail="Empty outline")

        # Create user-specific directories if they don't exist
        user_dir = Path('outputs') / str(user_id)
        blogs_dir = user_dir / 'blogs'
        blogs_dir.mkdir(parents=True, exist_ok=True)

        print(f"Generating blog for user {user_id} with outline: {outline}")

        # Generate blog using the provided outline
        result = generate_blog(outline, user_id)

        if result['status'] == 'success':
            markdown_content = ""
            blog_path = blogs_dir / 'blog_post.md'
            if blog_path.exists():
                with open(blog_path, 'r', encoding='utf-8') as f:
                    markdown_content = f.read()

            output_filename = 'blog_post.docx'
            if blog_path.exists():
                convert_markdown_to_docx(blog_path, output_filename, user_id)

                return JSONResponse(content={
                    'status': 'success',
                    'message': 'Blog post generated successfully',
                    'markdown': markdown_content,
                    'docxFile': output_filename
                })
            else:
                raise HTTPException(status_code=500, detail='Blog file not generated')
        else:
            raise HTTPException(status_code=500, detail=result.get('message', 'Failed to generate blog post'))
    except Exception as e:
        print(f"Error in generate_blog_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/cleanup/{user_id}")
def cleanup_user_data(user_id: str):
    """Clean up all data associated with the specified user.

    Args:
        user_id (str): Unique identifier for the user.

    Returns:
        JSONResponse: Status of the cleanup operation.
    """
    try:
        print(f"Cleaning up user data for {user_id}")
        user_dir = Path('outputs') / str(user_id)
        if user_dir.exists():
            try:
                shutil.rmtree(user_dir)
                print(f"Successfully deleted directory: {user_dir}")
            except PermissionError as pe:
                print(f"Permission error while deleting: {pe}")
                os.system(f'rm -rf "{user_dir}"')
            except Exception as e:
                print(f"Error while deleting directory: {e}")
                raise

        print(f"User data cleaned up successfully for {user_id}")
        return JSONResponse(content={
            'status': 'success',
            'message': 'User data cleaned up successfully'
        })
    except Exception as e:
        print(f"Error in cleanup_user_data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def index():
    """Index endpoint to check API status.

    Returns:
        JSONResponse: Welcome message.
    """
    return JSONResponse(content={
        'status': 'success',
        'message': 'Welcome to the API'
    })

if __name__ == '__main__':
    import uvicorn
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_ENV") == "development"

    if DEBUG:
        print(f'Starting development server on {HOST}:{PORT}')
        uvicorn.run(app, host=HOST, port=PORT, log_level="info")
    else:
        print(f'Starting production server on {HOST}:{PORT}')
        uvicorn.run(app, host=HOST, port=PORT, log_level="info")

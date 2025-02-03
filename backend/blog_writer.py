from pathlib import Path
import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch

load_dotenv()

def show_json(obj):
    """Display a JSON representation of the given object.

    Args:
        obj: The object to be converted to JSON and printed.
    """
    try:
        print(json.dumps(obj.model_dump(exclude_none=True), indent=2))
    except Exception as e:
        print(f"Error displaying JSON: {str(e)}")

def show_parts(r: genai.types.GenerateContentResponse, path: str, filename: str):
    """Write the content parts of the response to a file.

    Args:
        r (genai.types.GenerateContentResponse): The response containing content parts.
        path (str): The directory path where the file will be saved.
        filename (str): The name of the file to save the content.
    """
    try:
        parts = r.candidates[0].content.parts
        if parts is None:
            finish_reason = r.candidates[0].finish_reason
            print(f'Finish reason: {finish_reason}')
            return

        with open(path / filename, 'w', encoding='utf-8') as f:
            for part in parts:
                if part.text:
                    f.write(part.text)
                elif part.executable_code:
                    f.write(f'```python\n{part.executable_code.code}\n```\n')
                else:
                    show_json(part)  # Display JSON representation of the part

            # Write search metadata if available
            grounding_metadata = r.candidates[0].grounding_metadata
            if grounding_metadata and grounding_metadata.search_entry_point:
                f.write("\n--- Search Results Used ---\n")
                f.write(grounding_metadata.search_entry_point.rendered_content + '\n')

    except Exception as e:
        print(f"Error writing parts to file: {str(e)}")

def generate_blog(blog_outline, user_id):
    """Generate a blog post from an outline using Gemini with Google Search.

    Args:
        blog_outline (str): The outline for the blog post.
        user_id (str): The unique identifier for the user.

    Returns:
        dict: A dictionary containing the status and message of the blog generation.
    """
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        google_search_tool = Tool(google_search=GoogleSearch())

        # Prepare the search prompt for gathering information
        search_prompt = f"""
            You are an expert SEO content writer for Jaipuria Schools.
            Search about Jaipuria Schools, their history, their growth, their awards,
            their recognition, their total schools, their unique offerings, and their expertise.

            Websites to search:
            https://www.jaipuriaschools.ac.in
            https://www.jaipuriaschools.ac.in/why-jaipuria
            https://www.jaipuriaschools.ac.in/open-a-jaipuria-school

            You are given a blog outline and you need to search for current information,
            statistics, and expert insights about:
            {blog_outline}

            Focus on:
            1. Recent statistics and data
            2. Expert opinions and research
            3. Current trends and developments
            4. Best practices and examples
        """

        # Generate content with explicit search step
        search_response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=search_prompt,
            config=GenerateContentConfig(
                tools=[google_search_tool],
                response_modalities=["TEXT"],
                temperature=0.3,  # Lower temperature for factual search
            )
        )

        # Save search results
        output_dir = Path('outputs') / str(user_id) / 'blogs'
        output_dir.mkdir(parents=True, exist_ok=True)
        show_parts(search_response, output_dir, 'search_logs.md')

        # Prepare the blog prompt using the search results
        blog_prompt = f"""
            You are an expert SEO content writer for Jaipuria Schools.
            Using the research results above, write a detailed blog post.

            Follow these guidelines:
            1. Use Google Search to find current statistics, studies, and expert opinions
            2. Use proper markdown formatting with headers, lists, etc.
            3. Follow the exact structure from the outline
            4. Write in proper bullet points and paragraphs.
            5. Naturally incorporate the target keyword and its variations
            6. Focus on providing value and establishing Jaipuria Schools expertise
            7. Include relevant examples and actionable insights
            8. Make content factual and avoid controversial topics
            9. Don't compare with or mention other schools
            10. Write compelling meta description to boost Click-through rate (CTR)
            11. Content should meet Experience, Expertise, Authoritativeness, and Trustworthiness (EEAT) guidelines
            12. Add enough context to answer the query and make it more engaging and helpful for the reader
            13. Include recent statistics and data points from your search results
            14. Use the search results to add more context and credibility to the blog

            Blog Outline:
            {blog_outline}

            Format the output as:
            # [Blog Title]

            **Meta Description**: [compelling meta description with target keyword]
            **Target Keyword**: [main keyword from outline]
            **Word Count**: [actual word count]

            [Complete blog post content in markdown format...]
        """

        prompt = blog_prompt.format(outline=blog_outline)

        # Generate the final blog content
        blog_response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=[
                search_response,  # Include search results
                prompt            # Include blog prompt
            ],
            config=GenerateContentConfig(
                response_modalities=["TEXT"],
                temperature=0.3,
                candidate_count=1,
                max_output_tokens=4000,
            )
        )

        show_parts(blog_response, output_dir, 'blog_logs.md')
        blog_content = blog_response.text

        # Save the final blog content
        blog_path = output_dir / 'blog_post.md'
        with open(blog_path, 'w', encoding='utf-8') as f:
            f.write(blog_content)

        print(f"✓ Blog saved to: {blog_path}")

        return {
            'status': 'success',
            'message': 'Blog post generated successfully with Google Search integration',
            'content': blog_content
        }

    except Exception as e:
        print(f"Error generating blog: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }

if __name__ == "__main__":
    try:
        blog_outline = input("Enter the blog outline: ")
        generate_blog(blog_outline, "be16622a-ba35-4664-809c-f3d6bc6c19b5")
    except Exception as e:
        print(f"Error in main execution: {str(e)}")

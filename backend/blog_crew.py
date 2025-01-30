from crewai_tools import SerperDevTool, WebsiteSearchTool
from crewai.project import CrewBase, agent, crew, task
from crewai import Agent, Crew, Task, LLM
from pathlib import Path
import os

# Initialize language models with API keys from environment variables
gemini = LLM(
    model="gemini/gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY")
)

anthropic = LLM(
    model="claude-3-5-sonnet-20241022",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

deepseek = LLM(
    model="openrouter/deepseek/deepseek-r1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

@CrewBase
class BlogCrew():
    """Blog Crew for generating blog posts."""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self, user_id: str, outline: str):
        """
        Initialize the BlogCrew with user-specific settings.

        Args:
            user_id (str): The ID of the user for whom the blog is being generated.
            outline (str): The outline of the blog post.
        """
        try:
            self.user_id = user_id
            self.outline = outline
        except Exception as e:
            print(f"Error initializing BlogCrew: {e}")
            raise

    @agent
    def blog_writer_agent(self) -> Agent:
        """
        Create and return a blog writer agent configured with necessary tools.

        Returns:
            Agent: The configured blog writer agent.
        """
        try:
            return Agent(
                config=self.agents_config['blog_post_generator'],
                llm=deepseek,
                verbose=True
            )
        except Exception as e:
            print(f"Error creating blog writer agent: {e}")
            raise

    @task
    def generate_blog_post_task(self) -> Task:
        """
        Create and return a task for generating a blog post.

        Returns:
            Task: The configured task for generating a blog post.
        """
        try:
            return Task(
                config=self.tasks_config['generate_blog_post'],
                agent=self.blog_writer_agent(),
                tools=[
                    WebsiteSearchTool(
                        website="https://www.jaipuriaschools.ac.in/why-jaipuria",
                    ),
                    WebsiteSearchTool(
                        website="https://www.jaipuriaschools.ac.in/open-a-jaipuria-school",
                    ),
                    SerperDevTool(
                        api_key=os.getenv("SERPER_API_KEY")
                    )
                ],
                output_file=str(Path('outputs') / self.user_id / 'crew' / '4_blog_post.md')
            )
        except Exception as e:
            print(f"Error creating generate blog post task: {e}")
            raise

    @crew
    def crew(self) -> Crew:
        """
        Create and return the crew for executing tasks.

        Returns:
            Crew: The configured crew with agents and tasks.
        """
        try:
            return Crew(
                agents=self.agents,
                tasks=self.tasks,
                verbose=True
            )
        except Exception as e:
            print(f"Error creating crew: {e}")
            raise

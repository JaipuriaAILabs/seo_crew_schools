from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task, before_kickoff
from crewai_tools import FileReadTool, SerperDevTool, WebsiteSearchTool
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

serper_api_key = os.getenv("SERPER_API_KEY")

# Initialize LLMs with respective API keys
anthropic = LLM(
    model="claude-3-5-sonnet-20241022",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

gemini = LLM(
    model="gemini/gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY")
)

@CrewBase
class SeoCrew():
    """SEO Content Generation Crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self, user_id: str, inputs: dict):
        """
        Initialize the SeoCrew with user ID and inputs.

        Args:
            user_id (str): The ID of the user.
            inputs (dict): The input data for the crew.
        """
        self.user_id = user_id
        self.inputs = inputs
        super().__init__()

    @before_kickoff
    def setup(self, inputs):
        """Initialize data before running tasks.

        Args:
            inputs (dict): The input data to be set up.
        """
        try:
            self.inputs = inputs
        except Exception as e:
            print(f"Error during setup: {e}")

    @agent
    def ad_copy_specialist_agent(self) -> Agent:
        """Create an agent for generating ad copies.

        Returns:
            Agent: The ad copy specialist agent.
        """
        try:
            return Agent(
                config=self.agents_config['ad_copy_specialist'],
                tools=[
                    FileReadTool(
                        name="Read selected keywords data",
                        description="Read the selected_keywords.json file",
                        file_path=Path('outputs') / self.user_id / 'data' / 'selected_keywords_details.json',
                        encoding='utf-8',
                        errors='ignore'
                    )
                ],
                llm=anthropic,
                verbose=False
            )
        except Exception as e:
            print(f"Error creating ad copy specialist agent: {e}")

    @agent
    def blog_outline_strategist_agent(self) -> Agent:
        """Create an agent for generating blog post outlines.

        Returns:
            Agent: The blog outline strategist agent.
        """
        try:
            return Agent(
                config=self.agents_config['blog_outline_strategist'],
                tools=[
                    FileReadTool(
                        name="Read ad copies data",
                        description="Read the ad copies from 2_ad_copies.md file",
                        file_path=str(Path('outputs') / self.user_id / 'crew' / '2_ad_copies.md'),
                        encoding='utf-8',
                        errors='ignore'
                    ),
                    FileReadTool(
                        name="Read selected keywords data",
                        description="Read the selected keywords details",
                        file_path=str(Path('outputs') / self.user_id / 'data' / 'selected_keywords_details.json'),
                        encoding='utf-8',
                        errors='ignore'
                    ),
                    WebsiteSearchTool(
                        website="https://www.jaipuriaschools.ac.in/why-jaipuria",
                    ),
                    WebsiteSearchTool(
                        website="https://www.jaipuriaschools.ac.in/open-a-jaipuria-school",
                    ),
                    SerperDevTool(api_key=serper_api_key)
                ],
                llm=anthropic,
                verbose=False
            )
        except Exception as e:
            print(f"Error creating blog outline strategist agent: {e}")

    @task
    def generate_ad_copies_task(self) -> Task:
        """Define the task for generating ad copies.

        Returns:
            Task: The task for generating ad copies.
        """
        try:
            return Task(
                config=self.tasks_config['generate_ad_copies'],
                agent=self.ad_copy_specialist_agent(),
                output_file=str(Path('outputs') / self.user_id / 'crew' / '2_ad_copies.md')
            )
        except Exception as e:
            print(f"Error generating ad copies task: {e}")

    @task
    def generate_blog_post_outlines_task(self) -> Task:
        """Define the task for generating blog post outlines.

        Returns:
            Task: The task for generating blog post outlines.
        """
        try:
            return Task(
                config=self.tasks_config['generate_blog_post_outlines'],
                agent=self.blog_outline_strategist_agent(),
                context=[self.generate_ad_copies_task()],
                output_file=str(Path('outputs') / self.user_id / 'crew' / '3_blog_post_outlines.md')
            )
        except Exception as e:
            print(f"Error generating blog post outlines task: {e}")

    @crew
    def crew(self) -> Crew:
        """Create the crew for SEO content generation.

        Returns:
            Crew: The SEO content generation crew.
        """
        try:
            return Crew(
                agents=self.agents,
                tasks=self.tasks,
                verbose=True
            )
        except Exception as e:
            print(f"Error creating crew: {e}")

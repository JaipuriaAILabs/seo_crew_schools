from pathlib import Path
from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileReadTool
import os

# Initialize language models with API keys from environment variables
openai = LLM(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY")
)

gemini = LLM(
    model="gemini/gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY")
)

anthropic = LLM(
    model="claude-3-5-sonnet-20241022",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

@CrewBase
class AnalysisCrew():
    """Analysis Crew for processing and analyzing data."""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self, user_id: str, inputs: dict):
        """
        Initialize the AnalysisCrew with user-specific settings.

        Args:
            user_id (str): The ID of the user for whom the analysis is being performed.
            inputs (dict): The inputs required for the analysis.
        """
        try:
            self.user_id = user_id
            self.output_dir = Path('outputs') / str(user_id)
            self.output_dir.mkdir(parents=True, exist_ok=True)
            (self.output_dir / 'crew').mkdir(exist_ok=True)

            self.inputs = inputs
        except Exception as e:
            print(f"Error initializing AnalysisCrew: {e}")
            raise

    @agent
    def data_analyst_agent(self) -> Agent:
        """
        Create and return a data analyst agent configured with necessary tools.

        Returns:
            Agent: The configured data analyst agent.
        """
        try:
            return Agent(
                config=self.agents_config['data_analyst'],
                tools=[
                    FileReadTool(
                        name="Read competitor rankings data",
                        description="Read the competitor_rankings.json file",
                        file_path=self.output_dir / 'data' / 'competitor_rankings.json',
                        encoding='utf-8',
                        errors='ignore'
                    ),
                    FileReadTool(
                        name="Read user rankings data",
                        description="Read the user_rankings.json file",
                        file_path=self.output_dir / 'data' / 'user_rankings.json',
                        encoding='utf-8',
                        errors='ignore'
                    )
                ],
                llm=anthropic,
                verbose=False
            )
        except Exception as e:
            print(f"Error creating data analyst agent: {e}")
            raise

    @task
    def analyze_keyword_rankings_data_task(self) -> Task:
        """
        Create and return a task for analyzing keyword rankings data.

        Returns:
            Task: The configured task for analyzing keyword rankings data.
        """
        try:
            return Task(
                config=self.tasks_config['analyze_keyword_rankings_data'],
                agent=self.data_analyst_agent(),
                output_file=str(self.output_dir / 'crew' / '1_analysis.md')
            )
        except Exception as e:
            print(f"Error creating analyze keyword rankings data task: {e}")
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

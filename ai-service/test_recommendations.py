import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

from main import build_recommendations


class RecommendationTests(unittest.TestCase):
    def test_ai_and_full_stack_focus_returns_relevant_roles(self) -> None:
        recommendations = build_recommendations('Full-stack development and smart products')

        self.assertTrue(any('Full-Stack' in item for item in recommendations))
        self.assertTrue(any('Smart' in item for item in recommendations))

    def test_data_focus_returns_data_roles(self) -> None:
        recommendations = build_recommendations('Data analytics and dashboards')

        self.assertTrue(any('Data' in item for item in recommendations))


if __name__ == '__main__':
    unittest.main()

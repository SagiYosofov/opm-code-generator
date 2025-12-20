import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types

from definitions import opm_lecture_pdf_path

from ai.prompts import OPM_TEACHER_PROMPT

load_dotenv()

class GeminiOPMAgent:
    """
    This class wraps the Gemini AI client to make it easy to:
        - Load OPM rules once.
        - Send diagrams and generate code.
        - Refine code based on instructions.
    """
    def __init__(self):
        """
        Initializes the Gemini client and uploads the OPM knowledge base once.
        """
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_id = "gemini-2.0-flash"  # Efficient and free-tier friendly


        if not os.path.exists(opm_lecture_pdf_path):
            raise FileNotFoundError(f"Lecture PDF not found at {opm_lecture_pdf_path}")

        # Uploads the PDF once and stores it in self.knowledge_base.
        # This avoids uploading the same PDF every time we send a diagram.
        self.knowledge_base = self.client.files.upload(
            file=opm_lecture_pdf_path,
            config={'display_name': 'OPM_Core_Rules'}
        )

        # The system prompt defined in your previous message
        self.opm_teacher_prompt = OPM_TEACHER_PROMPT

    def _call_gemini(self, contents: list):
        """Internal helper to handle the API call and JSON enforcement."""
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"  # Forces Gemini to follow your JSON schema
            )
        )
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            return {"status": "invalid", "explanation": "Model failed to produce valid JSON."}

    def generate_code_from_diagram(self, diagram_bytes: bytes, language: str):
        """
        Purpose: Main entry point to generate code from a diagram.
        Steps:
            - Reuse the persistent PDF knowledge base.
            - Provide the system prompt.
            - Include the OPM diagram as bytes (image/png).
            - Specify the target programming language.
            - Calls _call_gemini → gets a JSON response with status, code, etc.
        """
        contents = [
            self.knowledge_base,  # Reusing the persistent PDF
            self.opm_teacher_prompt,
            types.Part.from_bytes(data=diagram_bytes, mime_type="image/png"),
            f"Target Programming Language: {language}"
        ]
        return self._call_gemini(contents)

    def refine_generated_code(self, diagram_bytes: bytes, language: str, previous_code: str, fix_instructions: str):
        """
        Refinement Turn: Updates existing code based on user feedback.
        """
        refinement_context = f"""
        This is a refinement request.
        Target Language: {language}
        Previous Code: {previous_code}
        User Fix Instructions: {fix_instructions}

        Update the OPM-to-code mapping according to these instructions while staying strictly 
        compliant with the OPM rules provided in the PDF.
        """

        contents = [
            self.knowledge_base,  # Reusing the persistent PDF
            self.opm_teacher_prompt,
            types.Part.from_bytes(data=diagram_bytes, mime_type="image/png"),
            refinement_context
        ]
        return self._call_gemini(contents)
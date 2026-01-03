import os
import json
import mimetypes
from dotenv import load_dotenv
from google import genai
from google.genai import types

from definitions import opm_manual_pdf_path, opm_lecture_pdf_path
from ai.prompts import OPM_SYSTEM_PROMPT

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
        self.model_id = "gemini-2.5-flash-lite"  # Efficient and free-tier friendly

        # Validate paths
        for path in [opm_manual_pdf_path, opm_lecture_pdf_path]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Knowledge file not found at {path}")

        # Upload BOTH knowledge sources, we store them in a list to pass to every prompt
        self.knowledge_base = [
            self.client.files.upload(file=opm_manual_pdf_path, config={'display_name': 'OPM_Manual'}),
            self.client.files.upload(file=opm_lecture_pdf_path, config={'display_name': 'OPM_Lecture'})
        ]

        # The system prompt
        self.opm_system_prompt = OPM_SYSTEM_PROMPT

    def _empty_invalid_response(self, msg: str) -> dict:
        """Returns a fully valid 'invalid' JSON structure."""
        return {"status": "invalid", "filename": "", "code": "", "explanation": msg}

    def _call_gemini(self, contents: list) -> dict:
        """Internal helper: calls Gemini and ensures valid JSON output."""
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=contents,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
        except Exception as e:
            return self._empty_invalid_response(f"API call failed: {e}")

        try:
            result = json.loads(response.text)
        except json.JSONDecodeError:
            return self._empty_invalid_response("Model failed to produce valid JSON.")

        # Validate all required keys
        required_keys = {"status", "filename", "code", "explanation"}
        if not required_keys.issubset(result.keys()):
            return self._empty_invalid_response("Model output missing required fields.")

        return result

    def generate_code_from_diagram(self, pdf_bytes: bytes, filename: str, language: str) -> dict:
        """
        Main entry point to generate code from OPM PDF diagram.

        Args:
            pdf_bytes: The binary content of the OPM diagram.
            filename: The original filename of the diagram.
            language: Target programming language (python, java, csharp, cpp)

        Returns:
            {
                "status": "valid" | "invalid",
                "explanation": "human-readable explanation",
                "code": "generated code skeleton" (only if valid),
                "filename": "output filename" (only if valid)
            }
        """
        contents = [
            *self.knowledge_base,  # Manual + Lecture
            self.opm_system_prompt,
            types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
            f"Target Programming Language: {language}"
        ]
        return self._call_gemini(contents)

    def refine_generated_code(self, pdf_bytes: bytes, filename: str, language: str, previous_code: str, fix_instructions: str) -> dict:
        """
        Refinement Turn: Updates existing code based on user feedback.

        Args:
            pdf_bytes: The binary content of the OPM diagram image
            filename: The original filename of the diagram
            language: Target programming language
            previous_code: The previously generated code skeleton
            fix_instructions: User's instructions for refining the code

        Returns:
            {
                "status": "valid" | "invalid",
                "explanation": "human-readable explanation",
                "code": "refined code skeleton" (only if valid),
                "filename": "output filename" (only if valid)
            }
        """
        refinement_context = f"""
        This is a REFINEMENT REQUEST:.
        Target Language: {language}
        Previous Code: {previous_code}
        User Fix Instructions: {fix_instructions}

        Please update the generated code strictly according to the OPM rules defined in the uploaded PDFs.
        """

        contents = [
            *self.knowledge_base,
            self.opm_system_prompt,
            types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
            refinement_context
        ]
        return self._call_gemini(contents)
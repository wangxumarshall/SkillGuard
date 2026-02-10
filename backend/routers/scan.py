from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from ..core.prompt_scanner import PromptScanner
from ..core.skill_scanner import SkillScanner

router = APIRouter(prefix="/api/scan", tags=["Scan"])

class PromptRequest(BaseModel):
    prompt: str

class SkillRequest(BaseModel):
    content: str
    filename: Optional[str] = "unknown.txt"

class ScanResponse(BaseModel):
    is_malicious: bool
    risk_level: str
    threat_type: str
    reasoning: str

prompt_scanner = PromptScanner()
skill_scanner = SkillScanner()

@router.post("/prompt", response_model=ScanResponse)
async def scan_prompt(request: PromptRequest):
    try:
        result = prompt_scanner.scan(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-text", response_model=ScanResponse)
async def scan_skill_text(request: SkillRequest):
    try:
        result = skill_scanner.scan(request.content, request.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-file", response_model=ScanResponse)
async def scan_skill_file(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        content = content_bytes.decode("utf-8") # Assume text files for now
        result = skill_scanner.scan(content, file.filename)
        return result
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be a text file (UTF-8).")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

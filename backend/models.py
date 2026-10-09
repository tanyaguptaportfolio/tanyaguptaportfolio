from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl


class ContentModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Role(ContentModel):
    id: str
    label: str
    description: str
    story: str | None = None
    skills: list[str]


class Project(ContentModel):
    id: str
    title: str
    category: str
    subtitle: str
    tags: list[str]
    color: str
    kind: str
    summary: str
    challenge: str
    approach: str
    outcome: str
    deliverables: list[str]


class Experience(ContentModel):
    company: str
    title: str
    period: str
    highlights: list[str]
    category: str = "Professional"
    location: str | None = None


class Education(ContentModel):
    institution: str
    degree: str
    period: str
    location: str | None = None
    category: str = "Learning"
    grade: str | None = None
    recognition: str | None = None


class Certification(ContentModel):
    name: str
    issuer: str
    category: str = "Certification"
    verified: bool = False
    details: str
    credential_url: HttpUrl | None = None


class ContactDetails(ContentModel):
    email: EmailStr
    linkedin_url: HttpUrl
    phone: Annotated[str, Field(pattern=r"^\+[1-9]\d{7,14}$")]
    phone_display: str


class Portfolio(ContentModel):
    name: str
    verified: bool
    headline: str
    intro: str
    about: str
    notice: str
    roles: list[Role]
    projects: list[Project]
    experience: list[Experience]
    education: list[Education]
    certifications: list[Certification] = Field(default_factory=list)
    contact: ContactDetails

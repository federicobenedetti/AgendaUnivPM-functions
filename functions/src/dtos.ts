export class CoursesRequestDto {
    corsi!: string[];
}

export class GenericRequestDto {
    matricola!: string;
}

export class AddUserFeedbackRequestDto extends GenericRequestDto {
    feedback!: string;
}

export class AddOrRemoveCourseToStudentRequestDto extends GenericRequestDto {
    idCorso!: string;
}

export class GetAllUserCoursesDto extends GenericRequestDto {
}
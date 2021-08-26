export class Teacher {
    teacherId!: string;
    name!: string;
    middleName!: string;
    lastName!: string;
}

export class Course {
    courseId!: string;
    description!: string;
    session!: string;
    teacherId!: string;
    title!: string;
}

export class Student {
    matricola!: string;
    telefono!: number;
    annoCorso!: number;
    corsi!: Course[];
    uid!: string;
    situazioneTasse!: boolean;
}

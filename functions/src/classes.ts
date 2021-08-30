/**
 * Classe che rappresenta un professore
 * 
 * teacherId: L'id del professore
 * name: Nome del professore
 * middleName: Secondo nome del professore
 * lastName: Cognome del professore
 */
export class Teacher {
    teacherId!: string;
    name!: string;
    middleName!: string;
    lastName!: string;
}

/**
 * Classe che rappresenta un corso
 * 
 * courseId: Id del corso
 * description: Descrizione del corso
 * session: Anno scolastico del corso
 * teacherId: Id del professore che tiene il corso
 * lessonIds: Array di Id lezioni relative al corso
 */
export class Course {
    courseId!: string;
    description!: string;
    session!: string;
    teacherId!: string;
    title!: string;
    lessonIds!: string[];
}

/**
 * Classe che rappresenta uno studente
 * 
 * matricola: autogenerata, matricola dello studente
 * telefono: autogenerato, numero di telefono dello studente
 * annoCorso: Anno di frequentazione del corso universitari
 * corsi: Array di Id di corsi a cui l'utente è iscritto
 * uid: Id univoco generato dalle API di Firebase una volta che un utente effettua il login
 * situazioneTasse: Booleano che indica se la situazione è 'da pagare' o 'regolare'
 */
export class Student {
    matricola!: string;
    telefono!: number;
    annoCorso!: number;
    corsi!: Course[];
    uid!: string;
    situazioneTasse!: boolean;
}

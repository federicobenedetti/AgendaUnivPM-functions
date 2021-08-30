/**
 * La generica richiesta DEVE avere in pancia
 * la matricola su cui andremo a fare le modifiche.
 */
export class GenericRequestDto {
    matricola!: string;
}

/**
 * Feedback: Feedback che aggiungo alla collection dei feedback
 */
export class AddUserFeedbackRequestDto extends GenericRequestDto {
    feedback!: string;
}

/**
 * Mi aspetto di ricevere l'id del corso da Aggiungere / rimuovere
 */
export class AddOrRemoveCourseToStudentRequestDto extends GenericRequestDto {
    idCorso!: string;
}

/**
 * Per ora vuoto, serve per avere contesto quando si legge il codice
 * della richiesta
 */
export class GetAllUserCoursesDto extends GenericRequestDto {
}
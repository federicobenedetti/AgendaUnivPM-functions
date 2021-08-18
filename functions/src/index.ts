import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

/**
 * Function called when a new user sign up
 */
exports.newUserSignup = functions.auth.user().onCreate((user) => {
    const nuovoStudente: Student = {
        matricola: "S" + randomInteger(10000, 99999),
        telefono: randomInteger(100000000, 999999999),
        annoCorso: randomInteger(1, 5),
        corsi: [],
        uid: user.uid
    }
    console.log("Nuovo utente creato!", user);

    admin.firestore().collection("students").doc(nuovoStudente.matricola).set(nuovoStudente);
});

exports.getUserFromAuthUid = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    console.log("E' stato richiesto l'utente per l'uid: " + uid);

    const student = await admin.firestore().collection("students").where("uid", "==", uid).get();

    const response = student.docs.map(doc => doc.data())[0];

    console.log("Studente trovato: ", response);
    return response

});

exports.addUserFeedback = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";
    const feedback = data.feedback as string;
    const matricola = data.matricola as string;

    if (feedback == null || feedback.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a non-empty feedback");
    }

    if (matricola == null || matricola.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a non-empty 'matricola'");
    }


    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    console.log("Aggiungo un nuovo feedback: " + feedback)
    console.log("Per l'utente: " + uid + " con matricola: " + matricola);

    admin.firestore().collection("feedbacks").doc(matricola).set({
        feedback: admin.firestore.FieldValue.arrayUnion(feedback)
    }, { merge: true })
});

exports.getAllCourses = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    console.log("Richiesta di tutti i corsi per l'utente: " + uid)

    const courses = admin.firestore().collection("courses").get();
    return courses;
});

// exports.getCoursesByNumber = functions.https.onCall((data, context) => {
//     // Checking that the user is authenticated.
//     if (!context.auth) {
//         // Throwing an HttpsError so that the client gets the error details.
//         throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
//     }

//     const uid = context.auth?.uid || "";

//     if (uid === "") {
//         throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
//     }
    
//     const matricola = data.matricola as string;

//     console.log("Richiesta di tutti i corsi per l'utente: " + uid + " matricola: " + matricola)
// });

/**
 * Returns an integer random number between min (included) and max (included)
 */
export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

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
}
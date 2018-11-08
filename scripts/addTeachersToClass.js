const mongoose = require("mongoose")
const Schema = mongoose.Schema

const db = require("../databases/accounts/index")

const UserModel = require("../models/user")
const ClassModel = require("../models/class")

const TEACHERS = [
  { firstName: "Jessica", lastName: "Lindblad" },
  { firstName: "Jessica", lastName: "Santoro-Mielentz" }
  { firstName: "Corianda", lastName: "Young" },
  { firstName: "Daniel", lastName: "Prator" },
  { firstName: "Dominic", lastName: "Porter" },
  { firstName: "Brittany", lastName: "Doctor" },
  { firstName: "Riyazuddin", lastName: "Mohammad" },
  { firstName: "Jamilla", lastName: "Youmans" },
  { firstName: "Olivia", lastName: "Ammonds" },
  { firstName: "Katherine", lastName: "Lovering" },
  { firstName: "Khalila", lastName: "Watson" },
  { firstName: "Ray", lastName: "Del Santos" },
  { firstName: "Chadasi", lastName: "Betterson" }
]

const run = async () => {
  const beachHighStudents = await UserModel.find(
    {
      "classes.0.id": "5ba8e590815226002076e52e"
    },
    { _id: 1 }
  )

  const beachHighStudentsIds = beachHighStudents.map(s => s._id)

  const teachers = TEACHERS.map(({ firstName, lastName }) => ({
    firstName,
    lastName,
    email: firstName.toLowerCase() + "507",
    password: "beach-2018",
    isTeacher: true
  }))

  for (const teacher of teachers) {
    try {
      const user = await UserModel.create(teacher)
      const _class = await ClassModel.create({
        teacher: user._id,
        students: beachHighStudentsIds
      })
      user.classes.push({
        id: _class._id,
        role: "teacher"
      })
      await user.save()
      console.log(teacher.email, teacher.password)
      console.log(_class._id)
    } catch (error) {
      console.log(error)
    }
  }

  process.exit(0)
}

run()

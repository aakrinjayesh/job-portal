// for zod validation
const validateInput = (Schema) => (req, res, next) => {
  try {
    console.log('req', req.body)
    const inputValidation = Schema.safeParse(req.body)
    req.body = inputValidation.data
    console.log("inputvalidation", inputValidation)
    if (inputValidation?.success !== true) {
      return res.status(400).json({ message: inputValidation?.error })
    }
    // req.body = inputValidation?.data
    next()
  } catch (err) {
    // res.status(400).json({ message: "please enter vaild data" })
    res.status(400).json({ message: err })
  }
}

export { validateInput } 
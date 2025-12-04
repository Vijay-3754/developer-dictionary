const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const developerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  role: Joi.string().valid('Frontend', 'Backend', 'Full-Stack').required(),
  techStack: Joi.string().trim().min(1).required(),
  experience: Joi.number().min(0).required(),
  description: Joi.string().trim().max(1000).allow('').optional(),
  joiningDate: Joi.date().optional(),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    next();
  };
};

module.exports = {
  validateSignup: validate(signupSchema),
  validateLogin: validate(loginSchema),
  validateDeveloper: validate(developerSchema),
};


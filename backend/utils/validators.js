const Joi = require("joi");
module.exports = {
  signup: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin","hr","manager","employee").default("employee"),
  }),
  applyLeave: Joi.object({
    leave_type_id: Joi.number().integer().required(),
    from_date: Joi.date().iso().required(),
    to_date: Joi.date().iso().min(Joi.ref("from_date")).required(),
    reason: Joi.string().min(5).max(1000).required(),
  }),
  approveLeave: Joi.object({
    remarks: Joi.string().max(500).allow("", null),
  }),
  leaveType: Joi.object({
    leave_name: Joi.string().min(2).required(),
    total_days: Joi.number().integer().min(0).required(),
    description: Joi.string().max(500).allow("", null),
  }),
};

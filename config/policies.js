/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {


  RegistationController: {
    listdata: "auth",
    adddata: "auth",
    deletedata: "auth",
    updatedata: "auth",
    profiledata: "auth",
    updateProfile: "auth",
    profileedit: "auth"
  },
  ResetpasswordController: {
    changepassword: "auth",
  }

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};

'use strict';

/**
 * A set of functions called "actions" for `admin`
 */

module.exports = {
  /**
   * @description: API to get global settings, such as registrations allowed or changing cpi allowed etc.
   * 
   * @auth This will be accessible to PUBLIC, without authentication
   * 
   * @note
   * - A settings entry MUST exist in the settings collection for these both routes to work
   * - You will require to create it manually from the strapi's admin UI, before using these APIs
   *
   * @example: [GET] `/api/admin/settings`
   *
   * @body Expected body as { "registrations_allowed": true, "cpi_change_allowed": true }
   */
  get_settings: async (ctx) => {
    /*
      // This function known from node_modules/@strapi/plugin-users-permissions/server/controllers/settings.js -> getAdvancedSettings
      // This is internal logic, no need to return it
      const strapi_settings = await strapi
        .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
        .get();

      if (!strapi_settings) {
        return ctx.internalServerError(null, [{ messages: [{ id: "Could not get strapi settings" }] }]);
      }

      const strapi_registrations_allowed = strapi_settings["allow_register"];
      const strapi_default_role = strapi_settings["default_role"];
    */

    // Query first entry of strapi settings collection
    const settings = await strapi.query('api::setting.setting').findOne({});

    if(!settings) {
      console.log("Setting entry not found. First create one under 'Setting' collection in the admin UI");
    }

    const {registrations_allowed, cpi_change_allowed} = settings;

    ctx.body = {
      // strapi_registrations_allowed,     /*This is an internal property, don't use it*/
      // strapi_default_role,              /*This is an internal property, don't use it*/
      registrations_allowed,
      cpi_change_allowed
    };
  },

  /**
   * @description: API to change global settings, such as allowing registrations or allowing cpi etc.
   * 
   * @auth Authentication with 'admin' role is required
   * 
   * @note
   * - This intentionally does NOT return anything to caller
   * - For getting settings, use get_settings(), that way caller can be sure that it's modified
   *
   * @example: [POST] `/api/admin/settings`
   *
   * @body Expected body as { "registrations_allowed": true, "cpi_change_allowed": true }
   */
  change_settings: async (ctx) => {
    const settings_to_change = {};

    const body = ctx.request.body;
    if(!body) {
      return ctx.internalServerError(null, [{ messages: [{ id: "No body found" }] }]);
    }

    const {registrations_allowed, cpi_change_allowed} = body;

    if(typeof(registrations_allowed) === "boolean") {
      settings_to_change["registrations_allowed"] = registrations_allowed;
    }

    if(typeof(cpi_change_allowed) === "boolean") {
      settings_to_change["cpi_change_allowed"] = cpi_change_allowed;
    }

    // Query setting collection
    if(!settings_to_change) {
      return ctx.badRequest(null, [{ messages: [{ id: "No settings to change" }] }]);
    }

    const settings = await strapi.query('api::setting.setting').update({
      where: {
        /*Note: Assumption: There must be one and only one setting entry, with id=1 */
        id: 1
      },
      data: settings_to_change
    });

    if (!settings) {
      return ctx.internalServerError(null, [{ messages: [{ id: "Could not change settings" }] }]);
    } else {
      ctx.body = "OK";
    }
  }
};

/* ex: set shiftwidth=2 expandtab: */

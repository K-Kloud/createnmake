
import { useAddAdminMutation } from "../mutations/useAddAdminMutation";
import { useRemoveAdminMutation } from "../mutations/useRemoveAdminMutation";
import { checkIfSuperAdmin } from "../utils/adminRoleUtils";

export const useAdminMutations = () => {
  const addAdminMutation = useAddAdminMutation();
  const removeAdminMutation = useRemoveAdminMutation();

  return {
    addAdminMutation,
    removeAdminMutation,
    isSuperAdmin: checkIfSuperAdmin
  };
};

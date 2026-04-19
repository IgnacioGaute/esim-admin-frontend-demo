import { useMemo, useState } from "react";
import { Box, Button, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { ModalConfirmDelete, NavigateLink } from "@/shared/components";
import { IUserData } from "@/admin/utils/interfaces/user-data.interface";
import { ListUserDataTable } from "@/admin/components/users/ListUserDataTable";
import { extractDataUserCompanyHelper } from "@/admin/utils/helpers/extractDataUserCompanyHelper";
import { alpha } from "@mui/material"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER";

type CurrentUser = {
  id: string;
  type: Role;
  companyId?: string | null;
};

const UserPageSkeleton = () => {
  return (
    <Box>
      <Box display="flex" width="100%" justifyContent="flex-end" mb={2.5}>
        <Skeleton variant="rounded" width={170} height={44} />
      </Box>

      <Box
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          p: 3,
          backgroundColor: "background.paper",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="rounded" width={420} height={52} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>

        <Box display="grid" gridTemplateColumns="40px 1.1fr 1.3fr 1fr 1fr 1fr 1fr" gap={2} mb={2}>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Box>

        {[1, 2, 3, 4, 5].map((item) => (
          <Box
            key={item}
            display="grid"
            gridTemplateColumns="40px 1.1fr 1.3fr 1fr 1fr 1fr 1fr"
            gap={2}
            alignItems="center"
            py={2}
            borderTop="1px solid"
            borderColor="divider"
          >
            <Box display="flex" gap={1}>
              <Skeleton variant="circular" width={22} height={22} />
              <Skeleton variant="circular" width={22} height={22} />
            </Box>
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
          </Box>
        ))}

        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={3}
          mt={3}
        >
          <Skeleton variant="text" width={110} height={30} />
          <Skeleton variant="text" width={90} height={30} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Box>
      </Box>
    </Box>
  );
};

export const UserPage = () => {
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();

  const [loadDelete, setLoadDelete] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const {
    data: me,
    loading: loadingMe,
  } = useFetch<IUserData & { amount?: number }>("users/me", "GET", {
    init: true,
    cache: { enabled: false },
  });

  const currentUser: CurrentUser | null = useMemo(() => {
    if (!me) return null;

    return {
      id: me.id,
      type: me.type as Role,
      companyId: (me as any).companyId ?? (me as any).company?.id ?? null,
    };
  }, [me]);

  const usersUrl = useMemo(() => {
    if (!currentUser) return "users";
    if (currentUser.type === "SUPER_ADMIN") return "users";
    if (!currentUser.companyId) return "users?companyId=none";
    return `users?companyId=${currentUser.companyId}`;
  }, [currentUser]);

  const {
    data: users,
    loading: loadingUsers,
    onRefresh,
    onFetch,
  } = useFetch<IUserData[]>(usersUrl, "GET", {
    init: Boolean(currentUser),
    cache: { enabled: false },
  });

  const onDeleteUser = async (id: string) => {
    setLoadDelete(true);
    const { ok } = await onFetch(`users/${id}`, "DELETE");
    setLoadDelete(false);

    if (!ok) return;

    setUserId("");
    snackBarAlert("El usuario se ha eliminado correctamente", { variant: "success" });
    onRefresh();
  };

  const parsedUsers = useMemo(() => {
    if (!users) return [];
    return extractDataUserCompanyHelper(users) as IUserData[];
  }, [users]);

  const isPageLoading = loadingMe || (Boolean(currentUser) && loadingUsers);

  if (currentUser?.type === "SELLER") {
    return null;
  }

  if (isPageLoading) {
    return <UserPageSkeleton />;
  }

  return (
    <Box>
      <Box display="flex" width="100%" justifyContent="flex-end" mb={2.5}>
        <NavigateLink
          to="new"
          uiLink={{ component: "span", underline: "none" }}
        >
          <Button
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              py: 1,
              transition: "all 0.2s ease",
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              },
            }}
          >
            Agregar Usuario
          </Button>
        </NavigateLink>
      </Box>

      <ListUserDataTable
        userList={parsedUsers}
        currentUser={currentUser}
        loading={false}
        onShowUser={(user) => navigate(`edit/${user.id}`)}
        onDelete={(id) => setUserId(id)}
        onEdit={(value) => navigate(`edit/${value}`)}
        onRuleUser={(idReseller, name) =>
          navigate(`rules?resellerId=${idReseller}&name=${name.split(" ").join("-")}`)
        }
        onCodeReferral={(id, name) =>
          navigate(`referral?userId=${id}&name=${name.split(" ").join("-")}`)
        }
      />

      <ModalConfirmDelete
        opened={userId !== ""}
        onClose={() => setUserId("")}
        onConfirm={() => onDeleteUser(userId)}
        title="¿Está seguro de eliminar este usuario?"
        desp="Si elimina el usuario, no podrá acceder a su información más adelante."
      />
    </Box>
  );
};
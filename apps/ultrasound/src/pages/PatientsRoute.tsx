import * as React from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import {
  PatientCreateModal,
  buildFullNameUzi,
  stripPolicyDigits,
  type PatientCreateValuesUzi,
} from "@medml/patient_create";
import { PatientsPage } from "@medml/patient_list";
import type { PatientListSort } from "@medml/patient_list";
import { PageShell } from "@medml/layout";

import { DoctorProfileCard } from "@medml/doctor_profile";

import {
  useGetDoctorProfileQuery,
  useGetUnreadNotificationsCountQuery,
} from "@/api/doctorApi";

import { isThyroidBackend } from "@/lib/apiBackend";
import {
  useCreateMedPatientCardMutation,
  useCreateMedPatientMutation,
  useCreateUziPatientWithCardMutation,
  useGetDoctorPatientsQuery,
} from "@/api/patientsApi";
import { useDoctorId } from "@/api/hooks/useDoctorId";

export default function PatientsRoute() {
  const navigate = useNavigate();
  const { doctorId, status } = useDoctorId();

  const { data: doctorProfile, isLoading: doctorProfileLoading } =
    useGetDoctorProfileQuery(doctorId, {
      skip: !doctorId || status !== "authenticated",
    });

  const { data: unreadCount = 0 } = useGetUnreadNotificationsCountQuery(doctorId, {
    skip: !doctorId || status !== "authenticated",
  });
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createThyroidPatient, { isLoading: isCreatingThyroid }] =
    useCreateUziPatientWithCardMutation();
  const [createMedPatient, { isLoading: isCreatingMedPatient }] =
    useCreateMedPatientMutation();
  const [createMedCard, { isLoading: isCreatingMedCard }] =
    useCreateMedPatientCardMutation();
  const isCreatingPatient = isThyroidBackend()
    ? isCreatingThyroid
    : isCreatingMedPatient || isCreatingMedCard;

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sort, setSort] = React.useState<PatientListSort>({ key: null, order: null });

  const { data, isFetching } = useGetDoctorPatientsQuery(
    {
      doctorId,
      search: search.trim() || undefined,
      page,
      pageSize,
      sortKey: sort.key,
      sortOrder: sort.order,
    },
    { skip: !doctorId || status !== "authenticated" }
  );

  const listLoading =
    (status === "authenticated" && !doctorId) ||
    (status === "authenticated" && isFetching);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  const handleCreateFinish = async (values: PatientCreateValuesUzi) => {
    if (!doctorId) {
      message.warning("Не удалось определить врача");
      return;
    }
    const birth_date = dayjs(values.birthDate).format("YYYY-MM-DD");
    const policy = stripPolicyDigits(values.policy);
    if (isThyroidBackend()) {
      const created = await createThyroidPatient({
        doctorId,
        surname: values.surname.trim(),
        name: values.name.trim(),
        patronymic: values.patronymic.trim(),
        email: values.email.trim(),
        policy,
        active: values.active,
        malignancy: values.malignancy,
        birth_date,
        diagnosis: values.diagnosis.trim(),
      }).unwrap();
      if (!created.id) {
        message.error("Сервер не вернул идентификатор пациента");
        return;
      }
    } else {
      const created = await createMedPatient({
        email: values.email.trim(),
        fullname: buildFullNameUzi(values),
        policy,
        active: values.active,
        malignancy: values.malignancy,
        birth_date,
      }).unwrap();
      const patientId =
        typeof created === "object" && created?.id ? String(created.id) : "";
      if (!patientId) {
        message.error("Сервер не вернул идентификатор пациента");
        return;
      }
      await createMedCard({
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis: values.diagnosis.trim(),
      }).unwrap();
    }
    message.success("Пациент создан");
    setCreateModalOpen(false);
  };

  return (
    <PageShell
      eyebrow="Врачебный кабинет"
      title="Пациенты"
      subtitle="Карты пациентов, снимки и результаты диагностики."
    >
      <DoctorProfileCard
        profile={doctorProfile}
        loading={doctorProfileLoading}
        unreadCount={unreadCount}
        onEditProfile={() => navigate("/profile/edit")}
      />

      <PatientsPage
        title="Мои пациенты"
        rows={rows}
        total={total}
        isLoading={listLoading}
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={setSearch}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        sort={sort}
        onSortChange={setSort}
        onAddPatient={() => setCreateModalOpen(true)}
        onOpenPatientCard={(id) => navigate(`/patient_profile?id=${id}`)}
      />
      <PatientCreateModal
        open={createModalOpen}
        variant="uzi"
        onCancel={() => setCreateModalOpen(false)}
        onFinish={(vals) => void handleCreateFinish(vals as PatientCreateValuesUzi)}
        confirmLoading={isCreatingPatient}
      />
    </PageShell>
  );
}

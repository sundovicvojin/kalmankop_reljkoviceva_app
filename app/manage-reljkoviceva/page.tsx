import { redirect } from "next/navigation";
import { ApartmentStatus, UnitType } from "@prisma/client";
import { logoutAction, updateApartment } from "@/lib/actions/admin";
import { ADMIN_ROUTE } from "@/lib/admin-config";
import { getApartments } from "@/lib/apartments";
import { isAdminAuthenticated } from "@/lib/auth";
import { statusLabels } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect(`${ADMIN_ROUTE}/login`);
  }

  const apartments = await getApartments();

  return (
    <main className="admin-page">
      <section className="admin-card">
        <div className="admin-top">
          <div>
            <p className="eyebrow">Reljkoviceva 59</p>
            <h1 className="admin-title">Statusi stanova</h1>
          </div>
          <form action={logoutAction}>
            <button className="header-link" type="submit">
              Odjava
            </button>
          </form>
        </div>

        {apartments.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Jedinica</th>
                <th>Podaci</th>
                <th>Trenutno</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apartment) => (
                <tr key={apartment.id}>
                  <td>
                    <strong>{apartment.unitType === "GARAGE" ? "Garaza" : "Stan"} {apartment.number}</strong>
                    <span className="admin-muted">{apartment.externalId}</span>
                  </td>
                  <td>
                    <form className="admin-unit-form" action={updateApartment}>
                      <input type="hidden" name="id" value={apartment.id} />
                      <label className="field compact">
                        <span>Broj</span>
                        <input className="input" name="number" defaultValue={apartment.number} required />
                      </label>
                      <label className="field compact">
                        <span>Sprat</span>
                        <input className="input" name="floor" defaultValue={apartment.floor} required />
                      </label>
                      <label className="field compact">
                        <span>Sobnost</span>
                        <input className="input" name="structure" defaultValue={apartment.structure} required />
                      </label>
                      <label className="field compact">
                        <span>Kvadratura</span>
                        <input className="input" name="totalArea" type="number" step="0.01" min="0" defaultValue={apartment.totalArea} required />
                      </label>
                      <label className="field compact">
                        <span>Sobe</span>
                        <input className="input" name="roomCount" type="number" step="0.5" min="0" defaultValue={apartment.roomCount ?? ""} />
                      </label>
                      <label className="field compact">
                        <span>Cena</span>
                        <input className="input" name="price" type="number" step="0.01" min="0" defaultValue={apartment.price ?? ""} />
                      </label>
                      <label className="field compact">
                        <span>Valuta</span>
                        <input className="input" name="currency" defaultValue={apartment.currency} required />
                      </label>
                      <label className="field compact">
                        <span>Tip</span>
                        <select className="select" name="unitType" defaultValue={apartment.unitType}>
                          {Object.values(UnitType).map((unitType) => (
                            <option key={unitType} value={unitType}>
                              {unitType === "GARAGE" ? "Garaza" : "Stan"}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="sr-only" htmlFor={`status-${apartment.id}`}>
                        Status za jedinicu {apartment.number}
                      </label>
                      <label className="field compact">
                        <span>Status</span>
                        <select className="select" id={`status-${apartment.id}`} name="status" defaultValue={apartment.status}>
                          {Object.values(ApartmentStatus).map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button className="button-main" type="submit">Sacuvaj</button>
                    </form>
                  </td>
                  <td>
                    <span className={`status-pill status-${apartment.status}`}>{statusLabels[apartment.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">Nema unetih stanova.</p>
        )}
      </section>
    </main>
  );
}

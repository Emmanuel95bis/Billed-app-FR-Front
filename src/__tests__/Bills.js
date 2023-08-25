/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import router from "../app/Router.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import Bills from "../containers/Bills.js";
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


  test("Then should display the new bill button", () => {
    document.body.innerHTML = BillsUI({ data: [] });
    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
  });
})
})


describe("When I click on the icon eye of bill", () => {
  test("that's openning a modal to see the picture", () => {
    $.fn.modal = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    document.body.innerHTML = BillsUI({ data: bills });
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const billsContainer = new Bills({
      document,
      onNavigate,
      store: store,
      localStorage: window.localStorage,
    });

    const handleClickIconEye = jest.fn((e) => billsContainer.handleClickIconEye(e.target));
    const eye = screen.getAllByTestId("icon-eye")[0];
    eye.addEventListener("click", handleClickIconEye);
    userEvent.click(eye);
    expect(handleClickIconEye).toHaveBeenCalled();

    eye.addEventListener("click", (e) => {
      handleClickIconEye(e.target);
      const modale = screen.getByTestId("modaleFile");
      expect(modale).toHaveClass("show");
    });
  });
});



describe("When we on the Bill page", () => {
  test("The icon eye button is present", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    expect(screen.getAllByTestId("icon-eye")).toBeTruthy();
  });
})


describe("When I am on Bill Page", () => {
  test("Then it should return bills data", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    store.bills = jest.fn().mockImplementationOnce(() => {
      return {
        list: jest.fn().mockResolvedValue([{ data: () => ({ date: "" }) }]),
      };
    });

    const bills = new Bills({
      document,
      onNavigate,
      store: store,
      localStorage,
    });

    const res = bills.getBills();
    expect(res).toEqual(Promise.resolve({}));
  });
});



// test d'intégration GET
describe("Im as an employee eon the bill pages", () => {
  describe("We should see the bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
     // await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentPending  = await screen.getByText("Type")
      expect(contentPending).toBeTruthy()
      const contentPending2  = await screen.getByText("Nom")
      expect(contentPending2).toBeTruthy()
      const contentPending3  = await screen.getByText("Date")
      expect(contentPending3).toBeTruthy()
      const contentPending4  = await screen.getByText("Montant")
      expect(contentPending4).toBeTruthy()
      const contentPending5  = await screen.getByText("Statut")
      expect(contentPending5).toBeTruthy()
      const contentPending6  = await screen.getByText("Actions")
      expect(contentPending6).toBeTruthy()

      const contentPending7 = await screen.getByText("Nouvelle note de frais");
      expect(contentPending7).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();

    });

   
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(store, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      store.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      store.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
 
  })
 
})


describe("use the newbill button", () => {
  test("When I click on new bill button", () => {
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname });
       };
 
       Object.defineProperty(window, "localStorage", {
         value: localStorageMock,
       });
       window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
 
       document.body.innerHTML = BillsUI({ data: bills });
 
       const Bill = new Bills({
         document,
         onNavigate,
         store: store,
         localStorage: window.localStorage,
       });
 
       const iconNewBill = screen.getByTestId("btn-new-bill");
       const handleNewBill = jest.fn((e) => {
         Bill.handleClickNewBill(e.target);
       });
 
       iconNewBill.addEventListener("click", handleNewBill);
       userEvent.click(iconNewBill);
 
       expect(handleNewBill).toHaveBeenCalled();
       expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
     });
   })
 
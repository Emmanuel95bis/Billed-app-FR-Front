

/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import router from "../app/Router";
import user from "@testing-library/user-event";
import store from "../__mocks__/store.js";

//describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      document.body.innerHTML = NewBillUI();

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Then it should render the new bill form", () => {
      document.body.innerHTML == NewBillUI();

      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getAllByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getAllByTestId("expense-type")).toBeTruthy();
      expect(screen.getAllByTestId("expense-name")).toBeTruthy();
      expect(screen.getAllByTestId("datepicker")).toBeTruthy();
      expect(screen.getAllByTestId("amount")).toBeTruthy();
      expect(screen.getAllByTestId("vat")).toBeTruthy();
      expect(screen.getAllByTestId("pct")).toBeTruthy();
      expect(screen.getAllByTestId("commentary")).toBeTruthy();
      expect(screen.getAllByTestId("file")).toBeTruthy();
      expect(screen.getAllByRole("button")).toBeTruthy();
    });
 
  })




// test d'intégration Post

describe("Given I am a user connected as Employee", () => {
  describe("When I submit the form completed", () => {
    test("Then the bill should be created", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "user@billed.com",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const billTest = {
        type: "Transport",
        name: "Vol Nice Paris",
        date: "2022-03-17",
        amount: 50,
        vat: 5,
        pct: 2,
        commentary: "some commentary",
        fileUrl: "../picture/0.jpg",
        fileName: "ticket.jpg",
        status: "pending",
      };

      screen.getByTestId("expense-type").value = billTest.type;
      screen.getByTestId("expense-name").value = billTest.name;
      screen.getByTestId("datepicker").value = billTest.date;
      screen.getByTestId("amount").value = billTest.amount;
      screen.getByTestId("vat").value = billTest.vat;
      screen.getByTestId("pct").value = billTest.pct;
      screen.getByTestId("commentary").value = billTest.commentary;

      newBill.fileName = billTest.fileName;
      newBill.fileUrl = billTest.fileUrl;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      const formBill = screen.getByTestId("form-new-bill");
      formBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formBill);

      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
    });

    test("fetches error from an API and fails with 500 error", async () => {
      jest.spyOn(store, "bills");
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

      const newBill = new NewBill({ document, onNavigate, store: store, localStorage: window.localStorage });

      store.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      const formBill = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      formBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formBill);
    });
  });
});


describe("When I am connected as an employee", () => {
  describe("And I am on NewBill Page", () => {
    test("Then we should see", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByText('Type de dépense')).toBeTruthy()
      expect(screen.getByText('Nom de la dépense')).toBeTruthy()
      expect(screen.getByText('Date')).toBeTruthy();
      expect(screen.getByText('Montant TTC')).toBeTruthy();
      expect(screen.getByText('TVA')).toBeTruthy();
      expect(screen.getByText('%')).toBeTruthy();
      expect(screen.getByText('Commentaire')).toBeTruthy();
      expect(screen.getByText('Justificatif')).toBeTruthy();

      expect(screen.getByRole('button', { name: 'Envoyer' })).toBeTruthy()
      
    })
  })
})


describe("When I am on the NewBill page and I upload a file with an extension jpg, jpeg, or png", () => {
  test("Then we should have a feed back true", () => {
    const newBill = new NewBill({
      document,
      onNavigate,
      store,
      localStorage: window.localStorage,
    });

    const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
    const checkedChangeFile = jest.spyOn(newBill, "checkedChangeFile");
    
    const image = screen.getByTestId("file");
    image.addEventListener("change", handleChangeFile);
    
    fireEvent.change(image, {
      target: {
        files: [
          new File(["file.jpg"], "file.jpg", { type: "file/jpg" }),
          new File(["file.jpeg"], "file.jpeg", { type: "file/jpeg" }),
          new File(["file.png"], "file.png", { type: "file/png" }),
        ],
      },
    });

    expect(checkedChangeFile).toHaveBeenCalled(); 
    expect(image.files[0].name).toBe("file.jpg");
    expect(image.files[1].name).toBe("file.jpeg");
    expect(image.files[2].name).toBe("file.png");
    user.upload(image, "file.jpg");
    user.upload(image, "file.jpeg");
    user.upload(image, "file.png");
    expect(checkedChangeFile("file.jpg")).toBe(true); 
    expect(checkedChangeFile("file.jpeg")).toBe(true); 
    expect(checkedChangeFile("file.png")).toBe(true); 

  });
});


describe("When I am on the NewBill page and I upload a file with an extension jpg, jpeg, or png", () => {
  test("Then we should have a feed back false", () => {
    const newBill = new NewBill({
      document,
      onNavigate,
      store,
      localStorage: window.localStorage,
    });

    const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
    const checkedChangeFile = jest.spyOn(newBill, "checkedChangeFile");
    
    const image = screen.getByTestId("file");
    image.addEventListener("change", handleChangeFile);
    
    fireEvent.change(image, {
      target: {
        files: [
          new File(["file.gif"], "file.gif", { type: "file/gif" }),
          new File(["file.pdf"], "file.pdf", { type: "file/pdf" }),
          new File(["file.doc"], "file.doc", { type: "file/doc" }),
        ],
      },
    });

    expect(checkedChangeFile).toHaveBeenCalled(); 
    expect(image.files[0].name).toBe("file.gif");
    expect(image.files[1].name).toBe("file.pdf");
    expect(image.files[2].name).toBe("file.doc");
    user.upload(image, "file.gif");
    user.upload(image, "file.pdf");
    user.upload(image, "file.doc");
    expect(checkedChangeFile("file.gif")).toBe(false); 
    expect(checkedChangeFile("file.pdf")).toBe(false); 
    expect(checkedChangeFile("file.doc")).toBe(false); 

  });
});







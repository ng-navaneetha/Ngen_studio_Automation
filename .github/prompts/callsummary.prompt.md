Generate a comprehensive Playwright test suite using @playwright/test in java script 


Flow:
1. Log in as host (ashok.kotakommula+100@ngenux.com/ Test@123)
2. click on "Insights" from the sidebar
3. click on create, select option in use case as "summary"
4. verify the reocrd is created in "summary" and click on it
5. verify all the create summary record and elements funtionality




the Playwright test code that automates the test cases scenarios:
Test Expectations:
- Automatically cover all relevant positive, negative, and edge test cases
- use Page Object model
- Write each assertion in a separate `test()` block with meaningful names
- Use only stable selectors like `getByRole` or `getByTestId`
- Focus on functional testing: verify not just visibility, but behavior and outcome of each action
- Organize tests using `test.describe()` for clarity
- Save the test file in the `/tests` directory
- create the manual test cases in csv file format with the following columns:
- Test Case ID
- Test Description
- Expected Result
- Actual Result
- Status (Pass/Fail)
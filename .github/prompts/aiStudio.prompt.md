Generate a comprehensive Playwright test suite using @playwright/test in TypeScript 


Flow:
1. Log in as host (ashok.kotakommula+10@ngenux.com/ Test123@)
2. click on " Ai Studio" from the sidebar
3. click on create, fill the fields and verify the funtionality flow of the create feature
4. create each workspace with each usecase option and verify that after creating them page redirects to the usecase page


create the manual test cases in csv file format with the following columns:
- Test Case ID
- Test Description
- Expected Result
- Actual Result
- Status (Pass/Fail)

as well as the Playwright test code that automates the manual test cases scenarios:
Test Expectations:
- Automatically cover all relevant positive, negative, and edge test cases
- Write each assertion in a separate `test()` block with meaningful names
- Use only stable selectors like `getByRole` or `getByTestId`
- Focus on functional testing: verify not just visibility, but behavior and outcome of each action
- Organize tests using `test.describe()` for clarity
- Save the test file in the `/tests` directory
